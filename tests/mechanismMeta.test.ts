import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { mechanisms, slugify } from "../src/lib/mechanisms/index";
import type { ModelMeta } from "../src/lib/types";

// Mechanism pages are hand-written, so these checks keep their structured part
// honest: matrix rows point at real models and options, every decision has a
// section to link to, and a newly added model carrying the page's tag can't be
// silently left out of the matrix.

const MODELS = fileURLToPath(new URL("../src/lib/models", import.meta.url));
const MECHANISMS = fileURLToPath(
  new URL("../src/lib/mechanisms", import.meta.url),
);

const modelMetas: ModelMeta[] = await Promise.all(
  readdirSync(MODELS)
    .filter((slug) => existsSync(`${MODELS}/${slug}/meta.ts`))
    .map(
      async (slug) =>
        ((await import(`${MODELS}/${slug}/meta.ts`)) as { meta: ModelMeta })
          .meta,
    ),
);
const modelSlugs = new Set(modelMetas.map((m) => m.slug));

function duplicates(ids: string[]): string[] {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

function headingSlugs(md: string): Set<string> {
  return new Set(
    [...md.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => slugify(m[1])),
  );
}

it("discovers every mechanism folder", () => {
  const dirs = readdirSync(MECHANISMS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  expect(mechanisms.map((m) => m.slug).sort()).toEqual(dirs.sort());
});

describe.each(mechanisms.map((m) => [m.slug, m] as const))(
  "%s",
  (slug, meta) => {
    const decisions = new Map(meta.decisions.map((d) => [d.id, d]));
    const rowIds = new Set(meta.rows.map((r) => r.id));

    it("has a page.md with a section per decision", () => {
      const path = `${MECHANISMS}/${slug}/page.md`;
      expect(existsSync(path)).toBe(true);
      const headings = headingSlugs(readFileSync(path, "utf8"));
      expect(
        meta.decisions.map((d) => d.id).filter((id) => !headings.has(id)),
      ).toEqual([]);
    });

    it("has unique ids", () => {
      expect(duplicates(meta.decisions.map((d) => d.id))).toEqual([]);
      expect(duplicates(meta.rows.map((r) => r.id))).toEqual([]);
      for (const d of meta.decisions)
        expect(duplicates(d.options.map((o) => o.id)), d.id).toEqual([]);
    });

    it("only chooses declared options", () => {
      const bad: string[] = [];
      for (const row of meta.rows)
        for (const [did, choice] of Object.entries(row.choices)) {
          const options = decisions.get(did)?.options.map((o) => o.id);
          if (!options) bad.push(`${row.id}: unknown decision ${did}`);
          else
            for (const c of [choice].flat())
              if (!options.includes(c)) bad.push(`${row.id}.${did}: ${c}`);
        }
      expect(bad).toEqual([]);
    });

    it("links only to existing models, rows and branches", () => {
      const branches = new Set(meta.branches?.map((b) => b.id));
      const bad: string[] = [];
      for (const row of meta.rows) {
        if (row.slug && !modelSlugs.has(row.slug))
          bad.push(`${row.id}: model ${row.slug}`);
        if (row.branch && !branches.has(row.branch))
          bad.push(`${row.id}: branch ${row.branch}`);
        for (const p of row.buildsOn ?? [])
          if (!rowIds.has(p)) bad.push(`${row.id}: buildsOn ${p}`);
      }
      expect(bad).toEqual([]);
    });

    it(`covers every model tagged "${meta.coverage.tag}"`, () => {
      const { category, tag } = meta.coverage;
      const listed = new Set(meta.rows.flatMap((r) => r.slug ?? []));
      const missing = modelMetas
        .filter((m) => (m.tags[category] as string[]).includes(tag))
        .map((m) => m.slug)
        .filter((s) => !listed.has(s));
      expect(missing).toEqual([]);
    });
  },
);
