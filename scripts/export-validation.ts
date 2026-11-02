/**
 * Writes a model's validations as an MxlPy notebook, or with --ops the Python op
 * helpers, for misc/mxl-e2e to execute:
 *
 *   vite-node scripts/export-validation.ts <slug> <out.ipynb> [--golden-series]
 *   vite-node scripts/export-validation.ts --json <slug> <out.json>
 *   vite-node scripts/export-validation.ts --ops <out.py>
 *   vite-node scripts/export-validation.ts --model <slug> <out.py>
 */
import { writeFileSync } from "node:fs";
import { OPS } from "../src/lib/validation/ops";
import {
  modelKind,
  toAnalysisDocument,
} from "../src/lib/validation/export/analysis";
import { toMxlpyNotebook } from "../src/lib/validation/export/mxlpy";

const [first, second, third] = process.argv.slice(2);

if (first === "--ops") {
  const sources = Object.values(OPS).map((op) => op.python.source);
  writeFileSync(second, sources.join("\n"));
} else if (first === "--json") {
  const { initModel } = await import(`../src/lib/models/${second}/model.ts`);
  const { validations } = await import(
    `../src/lib/models/${second}/validation.ts`
  );
  const doc = toAnalysisDocument(second, modelKind(initModel()), validations);
  writeFileSync(third, JSON.stringify(doc, null, 1));
} else if (first === "--model") {
  const { initModel } = await import(`../src/lib/models/${second}/model.ts`);
  writeFileSync(third, initModel().buildMxlpy());
} else {
  const { initModel } = await import(`../src/lib/models/${first}/model.ts`);
  const { validations } = await import(
    `../src/lib/models/${first}/validation.ts`
  );
  const notebook = toMxlpyNotebook(first, initModel(), validations, {
    goldenSeries: third === "--golden-series",
  });
  writeFileSync(second, JSON.stringify(notebook, null, 1));
}
