/**
 * Regenerate the committed `model.mxl.json` artifact next to every `model.ts`.
 *
 * `model.ts` stays the authoring source; this script lowers each one to the
 * canonical mxl-schemas `.mxl.json` that the app loads at runtime (see
 * `#lib/loadModel`). Run it whenever a `model.ts` changes:
 *
 *   npm run generate:mxl
 *
 * It runs under vite-node so `@computational-biology-aachen/mxlweb-core`
 * resolves to its `src/` via the `svelte` export condition — exactly the build
 * the app uses, so the emitted JSON matches runtime rather than a stale `dist/`.
 *
 * Each model is gated on **codegen-artifact parity**: we build the model both
 * from `model.ts` and from the JSON we just emitted (via `mxlJsonToModel`) and
 * assert the two produce byte-identical simulation code — RHS, derived
 * quantities, names, initial/parameter values and LaTeX. A model that fails the
 * gate is skipped (its `.ts` fallback still carries the app) and reported; the
 * script exits non-zero if anything failed.
 */
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { ModelBuilderBase } from "@computational-biology-aachen/mxlweb-core";
import { mxlJsonToModel } from "@computational-biology-aachen/mxlweb-core/mxl";

// Eager glob with the same resolution the app uses, keyed by absolute-ish path.
const modelModules = import.meta.glob<{ initModel: () => ModelBuilderBase }>(
  "../src/lib/models/*/model.ts",
  { eager: true },
);

/** The simulation-relevant surface every backend consumes. Equal fingerprint ⇒ identical simulation. */
function fingerprint(model: ModelBuilderBase): string {
  const { allDerived, selectDerived } = model.buildJsDerived();
  return JSON.stringify({
    names: model.getNames(),
    parNames: model.getParameterNames(),
    pars: model.resolveParameters(),
    init: model.resolveInitialValues(),
    rhs: model.buildJs(),
    allDerived,
    selectDerived,
    tex: model.buildTex(),
  });
}

const slugFromPath = (path: string): string =>
  path.match(/\/models\/([^/]+)\/model\.ts$/)?.[1] ?? path;

const failures: string[] = [];
let written = 0;

for (const [path, mod] of Object.entries(modelModules)) {
  const slug = slugFromPath(path);
  try {
    const source = mod.initModel();
    const json = source.buildMxlJson(slug);

    // Reload from the emitted JSON and prove it round-trips losslessly...
    const reloaded = mxlJsonToModel(json);
    if (reloaded.constructor !== source.constructor) {
      throw new Error(
        `reloaded model is ${reloaded.constructor.name}, expected ${source.constructor.name}`,
      );
    }
    // ...both structurally (re-emit must be identical — catches import asymmetry)
    if (reloaded.buildMxlJson(slug) !== json) {
      throw new Error("re-emitted JSON differs from first emission");
    }
    // ...and in the code each path actually simulates (catches buildMxlJson gaps).
    if (fingerprint(reloaded) !== fingerprint(source)) {
      throw new Error("codegen differs between model.ts and model.mxl.json");
    }

    const outPath = `${dirname(fileURLToPath(new URL(path, import.meta.url)))}/model.mxl.json`;
    writeFileSync(outPath, json + "\n");
    written += 1;
    console.log(`✓ ${slug}`);
  } catch (err) {
    failures.push(slug);
    console.error(`✗ ${slug}: ${err instanceof Error ? err.message : err}`);
  }
}

console.log(`\n${written} written, ${failures.length} failed.`);
if (failures.length > 0) {
  console.error(`Failed: ${failures.join(", ")}`);
  process.exit(1);
}
