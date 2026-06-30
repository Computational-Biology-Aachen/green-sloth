/**
 * CI gate for the committed model data files. For every `model.mxl.json`:
 *
 *   1. Schema-validate it — `mxlJsonToModel` checks the document against the
 *      vendored mxl-schemas v1 schema and throws on any violation.
 *   2. Soundness-check it — the model must be kinetic, have at least one state
 *      variable with finite initial values, and lower cleanly to the WAT/WASM
 *      backend the app actually runs (`buildWat`). Catches structurally broken
 *      contributions before they reach the site.
 *
 * Run locally with `npm run validate:models`; wired into PR CI. Exits non-zero
 * if any model fails, listing the offenders.
 *
 * Note: this exercises the WAT codegen path (the only backend greensloth ships).
 * A full headless *numerical* integration would need either the Emscripten WASM
 * runtime (pointer-marshalled, heavy) or the JS backend (not used in production
 * and currently mis-orders intermediates for a couple of models), so it is left
 * out deliberately.
 */
import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import { mxlJsonToModel } from "@computational-biology-aachen/mxlweb-core/mxl";

const jsonModules = import.meta.glob<string>(
  "../src/lib/models/*/model.mxl.json",
  { eager: true, query: "?raw", import: "default" },
);

const slugFromPath = (path: string): string =>
  path.match(/\/models\/([^/]+)\/model\.mxl\.json$/)?.[1] ?? path;

function check(model: KineticModelBuilder): void {
  if (model.getNames().length === 0) {
    throw new Error("model has no state variables");
  }
  if (!model.resolveInitialValues().every(Number.isFinite)) {
    throw new Error("non-finite initial values");
  }
  if (model.buildWat().trim() === "") {
    throw new Error("WAT codegen produced empty output");
  }
}

const failures: string[] = [];

for (const [path, raw] of Object.entries(jsonModules)) {
  const slug = slugFromPath(path);
  try {
    const model = mxlJsonToModel(raw); // throws on schema violation
    if (!(model instanceof KineticModelBuilder)) {
      throw new Error(`expected a kinetic model, got ${model.constructor.name}`);
    }
    check(model);
    console.log(`✓ ${slug}`);
  } catch (err) {
    failures.push(slug);
    console.error(`✗ ${slug}: ${err instanceof Error ? err.message : err}`);
  }
}

console.log(
  `\n${Object.keys(jsonModules).length - failures.length} valid, ${failures.length} failed.`,
);
if (failures.length > 0) {
  console.error(`Failed: ${failures.join(", ")}`);
  process.exit(1);
}
