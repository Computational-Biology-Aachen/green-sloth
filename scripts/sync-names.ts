/**
 * Propose and apply a shared-name map across src/lib/models/*\/model.ts.
 *
 * `suggest` loads every model's live builder (via `import.meta.glob`) and
 * groups its variable/parameter/assignment/reaction identifiers by a dumb
 * case/punctuation-insensitive normalization. Groups that hit 2+ different
 * models are written to an editable JSON file. Open that file and, for each
 * group you want to keep, fill in `key` (the names.ts key to use) and
 * `displayName` (the canonical label) — leave both blank to drop a false
 * positive, or delete individual occurrences that don't belong.
 *
 * `apply` reads that edited file, merges the filled-in groups into
 * src/lib/names.ts, and inserts `displayName: names.<key>` into the matching
 * builder call in each model.ts (adding the `names` import if it's missing).
 *
 * This heuristic has no notion of physical meaning — it will happily merge
 * two identically-spelled identifiers that mean different things in
 * different models. That's expected: it's meant to be compared against, not
 * to replace, a manually reviewed pass.
 *
 * Usage:
 *   npm run sync:names -- suggest [out.json]
 *   npm run sync:names -- apply <edited.json>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  KineticModelBuilder,
  type ModelBuilderBase,
} from "@computational-biology-aachen/mxlweb-core";
import * as ts from "typescript";

type Category = "variables" | "parameters" | "assignments" | "reactions";
const CATEGORIES: Category[] = [
  "variables",
  "parameters",
  "assignments",
  "reactions",
];
const ADD_METHOD: Record<Category, string> = {
  variables: "addVariable",
  parameters: "addParameter",
  assignments: "addAssignment",
  reactions: "addReaction",
};

type Occurrence = { model: string; category: Category; id: string };
type Group = {
  key: string;
  displayName: string;
  normalized: string;
  occurrences: Occurrence[];
};

function normalize(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getMap(
  model: ModelBuilderBase,
  category: Category,
): Map<string, unknown> | undefined {
  if (category === "reactions") {
    return model instanceof KineticModelBuilder ? model.reactions : undefined;
  }
  return model[category];
}

async function collectOccurrences(): Promise<Occurrence[]> {
  const modules = import.meta.glob<{ initModel: () => ModelBuilderBase }>(
    "../src/lib/models/*/model.ts",
  );
  const occurrences: Occurrence[] = [];
  for (const [path, load] of Object.entries(modules)) {
    const slug = path.match(/\/models\/([^/]+)\/model\.ts$/)?.[1];
    if (!slug) continue;
    const model = (await load()).initModel();
    for (const category of CATEGORIES) {
      const map = getMap(model, category);
      if (!map) continue;
      for (const id of map.keys()) occurrences.push({ model: slug, category, id });
    }
  }
  return occurrences;
}

function groupOccurrences(occurrences: Occurrence[]): Group[] {
  const byNorm = new Map<string, Occurrence[]>();
  for (const occ of occurrences) {
    const norm = normalize(occ.id);
    (byNorm.get(norm) ?? byNorm.set(norm, []).get(norm)!).push(occ);
  }
  const groups: Group[] = [];
  for (const [normalized, occs] of byNorm) {
    if (new Set(occs.map((o) => o.model)).size < 2) continue;
    groups.push({ key: "", displayName: "", normalized, occurrences: occs });
  }
  groups.sort((a, b) => b.occurrences.length - a.occurrences.length);
  return groups;
}

function namesPath(): string {
  return fileURLToPath(new URL("../src/lib/names.ts", import.meta.url));
}

function modelPath(slug: string): string {
  return fileURLToPath(
    new URL(`../src/lib/models/${slug}/model.ts`, import.meta.url),
  );
}

function mergeNames(accepted: Group[]): void {
  const path = namesPath();
  const source = readFileSync(path, "utf-8");
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const exportAssign = sourceFile.statements.find(ts.isExportAssignment);
  if (!exportAssign || !ts.isObjectLiteralExpression(exportAssign.expression)) {
    throw new Error("names.ts must be `export default { ... }`");
  }
  const obj = exportAssign.expression;
  const existingKeys = new Set(
    obj.properties
      .filter(ts.isPropertyAssignment)
      .map((p) => p.name.getText(sourceFile)),
  );
  const newEntries = accepted.filter((g) => !existingKeys.has(g.key));
  if (newEntries.length === 0) return;

  const insertPos = obj.properties.end;
  const insertion = newEntries
    .map((g) => `\n  ${g.key}: ${JSON.stringify(g.displayName)},`)
    .join("");
  writeFileSync(
    path,
    source.slice(0, insertPos) + insertion + source.slice(insertPos),
  );
  console.log(`names.ts: added ${newEntries.length} new key(s)`);
}

function editModelFile(
  slug: string,
  edits: { category: Category; id: string; key: string }[],
): string | undefined {
  const path = modelPath(slug);
  let source = readFileSync(path, "utf-8");
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const remaining = new Map(
    edits.map((e) => [`${e.category}:${e.id}`, e]),
  );
  const insertions: { pos: number; text: string }[] = [];

  function visit(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.arguments.length >= 2
    ) {
      const category = CATEGORIES.find(
        (c) => ADD_METHOD[c] === (node.expression as ts.PropertyAccessExpression).name.text,
      );
      const [firstArg, secondArg] = node.arguments;
      if (
        category &&
        ts.isStringLiteral(firstArg) &&
        ts.isObjectLiteralExpression(secondArg)
      ) {
        const edit = remaining.get(`${category}:${firstArg.text}`);
        if (edit) {
          const hasDisplayName = secondArg.properties.some(
            (p) =>
              ts.isPropertyAssignment(p) &&
              p.name.getText(sourceFile) === "displayName",
          );
          if (!hasDisplayName) {
            insertions.push({
              pos: secondArg.getStart(sourceFile) + 1,
              text: ` displayName: names.${edit.key},`,
            });
          }
          remaining.delete(`${category}:${firstArg.text}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  if (insertions.length === 0) return undefined;

  insertions.sort((a, b) => b.pos - a.pos);
  for (const { pos, text } of insertions) {
    source = source.slice(0, pos) + text + source.slice(pos);
  }

  if (!/from ["']\$lib\/names["']/.test(source)) {
    const importRegex = /^import .*;\n/gm;
    let lastImportEnd = 0;
    let m: RegExpExecArray | null;
    while ((m = importRegex.exec(source))) lastImportEnd = m.index + m[0].length;
    source =
      source.slice(0, lastImportEnd) +
      `import names from "$lib/names";\n` +
      source.slice(lastImportEnd);
  }

  writeFileSync(path, source);
  console.log(`${slug}/model.ts: ${insertions.length} displayName(s) added`);
  return path;
}

function applyGroups(groups: Group[]): void {
  const accepted = groups.filter(
    (g) => g.key.trim() !== "" && g.displayName.trim() !== "",
  );
  if (accepted.length === 0) {
    console.log("no groups with both key and displayName filled in — nothing to do");
    return;
  }
  mergeNames(accepted);

  const byModel = new Map<
    string,
    { category: Category; id: string; key: string }[]
  >();
  for (const g of accepted) {
    for (const occ of g.occurrences) {
      const list = byModel.get(occ.model) ?? [];
      list.push({ category: occ.category, id: occ.id, key: g.key });
      byModel.set(occ.model, list);
    }
  }

  const touched: string[] = [namesPath()];
  for (const [slug, edits] of byModel) {
    const path = editModelFile(slug, edits);
    if (path) touched.push(path);
  }

  execFileSync("npx", ["prettier", "--write", ...touched], { stdio: "inherit" });
}

async function main(): Promise<void> {
  const [, , cmd, arg] = process.argv;
  if (cmd === "suggest") {
    const groups = groupOccurrences(await collectOccurrences());
    const outPath = arg ?? "scripts/name-suggestions.json";
    writeFileSync(outPath, JSON.stringify({ groups }, null, 2));
    console.log(`${groups.length} candidate group(s) -> ${outPath}`);
  } else if (cmd === "apply") {
    if (!arg) throw new Error("usage: sync-names.ts apply <edited.json>");
    const { groups } = JSON.parse(readFileSync(arg, "utf-8")) as {
      groups: Group[];
    };
    applyGroups(groups);
  } else {
    console.error("usage: sync-names.ts <suggest|apply> [file]");
    process.exit(1);
  }
}

main();
