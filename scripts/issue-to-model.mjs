/**
 * Parse a "Contribute a model" issue-form body (see
 * .github/ISSUE_TEMPLATE/model-contribution.yml) and materialise the model
 * folder under src/lib/models/<slug>/. Driven by the model-contribution
 * workflow; pure Node, no deps, so it can be unit-tested locally:
 *
 *   ISSUE_BODY="$(cat sample-issue.md)" node scripts/issue-to-model.mjs
 *
 * Writes the files and prints the slug to stdout (and to $GITHUB_OUTPUT as
 * `slug=` when running in Actions). Exits non-zero on a malformed submission.
 */
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

/**
 * Split an issue-form body into { label -> value }. GitHub renders each field
 * as a `### Label` heading followed by its value; `render:` textareas wrap the
 * value in a fenced code block, which we unwrap. Empty optional fields render
 * as `_No response_`.
 */
function parseSections(body) {
  const sections = {};
  const parts = body.replace(/\r\n/g, "\n").split(/^### +/m);
  for (const part of parts.slice(1)) {
    const nl = part.indexOf("\n");
    const label = part.slice(0, nl === -1 ? undefined : nl).trim();
    let value = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    if (value === "_No response_") value = "";
    // Unwrap a single fenced code block (```lang ... ```), if present.
    const fenced = value.match(/^```[^\n]*\n([\s\S]*?)\n```$/);
    if (fenced) value = fenced[1];
    sections[label] = value;
  }
  return sections;
}

function require_(sections, label) {
  const value = sections[label];
  if (!value) throw new Error(`missing required field: "${label}"`);
  return value;
}

const body = process.env.ISSUE_BODY;
if (!body) {
  console.error("ISSUE_BODY env var is required");
  process.exit(1);
}

const s = parseSections(body);

const slug = require_(s, "Slug").trim();
if (!/^[a-z0-9_]+$/.test(slug)) {
  throw new Error(`invalid slug "${slug}" — use lowercase letters, digits, underscores`);
}

const format = require_(s, "Model format").toLowerCase();
const modelFile = format.startsWith("sbml") ? "model.sbml" : "model.mxl.json";

const files = {
  [modelFile]: require_(s, "Model file"),
  "meta.ts": require_(s, "meta.ts"),
  "model.md": require_(s, "model.md"),
};
if (s["comment.md"]) files["comment.md"] = s["comment.md"];
if (s["scheme.svg"]) files["scheme.svg"] = s["scheme.svg"];

const dir = `${repoRoot}src/lib/models/${slug}`;
mkdirSync(dir, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  const path = `${dir}/${name}`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.endsWith("\n") ? content : content + "\n");
  console.log(`wrote ${name} (${content.length} chars)`);
}

console.log(slug);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `slug=${slug}\n`);
}
