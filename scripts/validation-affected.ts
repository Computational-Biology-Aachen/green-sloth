/**
 * Runs the validations of models whose inputs changed since their last pass.
 * A model's hash covers its model.ts, meta.ts, validation.ts, golden and assets,
 * plus everything shared: the engine, and the mxlweb-core pin that holds the
 * solver. Engine changes therefore re-run every model. Passes are recorded as
 * stamp files, which CI keeps in actions/cache.
 *
 *   npm run test:validation            # affected models
 *   npm run test:validation -- --all   # every model
 *   npm run test:validation -- --list  # print affected models, don't run
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const MODELS = join(ROOT, "src/lib/models");
const ENGINE = join(ROOT, "src/lib/validation");
const STAMPS = join(ROOT, "node_modules/.cache/validation");

function filesIn(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path)
    .sort()
    .flatMap((name) => filesIn(join(path, name)));
}

function hashFiles(paths: string[]): string {
  const hash = createHash("sha256");
  for (const path of paths.flatMap(filesIn)) {
    hash.update(path.slice(ROOT.length)).update(readFileSync(path));
  }
  return hash.digest("hex");
}

function corePin(): string {
  const lock = JSON.parse(
    readFileSync(join(ROOT, "package-lock.json"), "utf8"),
  ) as { packages: Record<string, { resolved?: string }> };
  return (
    lock.packages["node_modules/@computational-biology-aachen/mxlweb-core"]
      ?.resolved ?? ""
  );
}

const shared = hashFiles([
  ENGINE,
  join(ROOT, "tests/validation.test.ts"),
  join(ROOT, "tests/support/simulate.ts"),
]);
const pin = corePin();

const modelHash = (slug: string) =>
  createHash("sha256")
    .update(shared)
    .update(pin)
    .update(
      hashFiles(
        [
          "model.ts",
          "meta.ts",
          "validation.ts",
          "validation.golden.json",
          "assets",
        ].map((f) => join(MODELS, slug, f)),
      ),
    )
    .digest("hex");

const args = process.argv.slice(2);
const slugs = readdirSync(MODELS).filter((slug) =>
  existsSync(join(MODELS, slug, "validation.ts")),
);
const stampOf = (slug: string) => join(STAMPS, `${slug}-${modelHash(slug)}`);
const affected = args.includes("--all")
  ? slugs
  : slugs.filter((slug) => !existsSync(stampOf(slug)));

if (args.includes("--list")) {
  console.log(affected.join("\n"));
  process.exit(0);
}
if (affected.length === 0) {
  console.log("No validation inputs changed.");
  process.exit(0);
}

console.log(`Validating: ${affected.join(", ")}`);
mkdirSync(STAMPS, { recursive: true });
// One process per model, so one failure doesn't discard the others' passes.
let failed = false;
for (const slug of affected) {
  const { status } = spawnSync(
    "npx",
    [
      "vitest",
      "run",
      "tests/validation.test.ts",
      "--disable-console-intercept",
    ],
    {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, VALIDATE_MODELS: slug },
    },
  );
  if (status === 0) writeFileSync(stampOf(slug), "");
  else failed = true;
}
process.exit(failed ? 1 : 0);
