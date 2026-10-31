/**
 * Writes a model's validations as an MxlPy notebook, or with --ops the Python op
 * helpers, for misc/mxl-e2e to execute:
 *
 *   vite-node scripts/export-validation.ts <slug> <out.ipynb>
 *   vite-node scripts/export-validation.ts --ops <out.py>
 */
import { writeFileSync } from "node:fs";
import { OPS } from "../src/lib/validation/ops";
import { toMxlpyNotebook } from "../src/lib/validation/export/mxlpy";

const [first, second] = process.argv.slice(2);

if (first === "--ops") {
  const sources = Object.values(OPS).map((op) => op.python.source);
  writeFileSync(second, sources.join("\n"));
} else {
  const { initModel } = await import(`../src/lib/models/${first}/model.ts`);
  const { validations } = await import(
    `../src/lib/models/${first}/validation.ts`
  );
  const notebook = toMxlpyNotebook(first, initModel(), validations);
  writeFileSync(second, JSON.stringify(notebook, null, 1));
}
