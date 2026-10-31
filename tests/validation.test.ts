import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import { beforeAll, describe, expect, it } from "vitest";
import {
  compareValidation,
  type GoldenFile,
} from "../src/lib/validation/compare";
import { runValidation, type Simulate } from "../src/lib/validation/run";
import type { Validation } from "../src/lib/validation/types";
import { nodeSimulate } from "./support/simulate";

// Slow: simulates every figure. VALIDATE_MODELS picks the models to run
// (scripts/validation-affected.ts); plain "npm test" sets none.

const MODELS = fileURLToPath(new URL("../src/lib/models", import.meta.url));
const requested = (process.env.VALIDATE_MODELS ?? "")
  .split(",")
  .filter(Boolean);
const slugs = readdirSync(MODELS).filter(
  (slug) =>
    requested.includes(slug) && existsSync(`${MODELS}/${slug}/validation.ts`),
);
const TIMEOUT_MS = Number(process.env.VALIDATE_TIMEOUT_MS ?? 600_000);

let simulate: Simulate;
beforeAll(async () => {
  simulate = await nodeSimulate();
});

describe.runIf(slugs.length > 0).each(slugs)("%s validation", (slug) => {
  it("reproduces its goldens", { timeout: TIMEOUT_MS }, async () => {
    const { initModel } = (await import(`${MODELS}/${slug}/model.ts`)) as {
      initModel(): KineticModelBuilder;
    };
    const { validations } = (await import(
      `${MODELS}/${slug}/validation.ts`
    )) as { validations: Validation[] };
    const golden = JSON.parse(
      readFileSync(`${MODELS}/${slug}/validation.golden.json`, "utf8"),
    ) as GoldenFile;

    const failed: string[] = [];
    for (const validation of validations) {
      const started = Date.now();
      const result = await runValidation(validation, initModel(), simulate);
      const rows = compareValidation(validation, result, golden);
      console.log(
        `${slug}/${validation.id}: ${(Date.now() - started) / 1000}s`,
      );
      for (const r of rows) {
        const line = `${r.figure}/${r.series}: max rel. error ${r.relativeError.toExponential(2)} at x=${r.atX} (tolerance ${r.tolerance})`;
        console.log(`  ${r.passed ? "ok  " : "FAIL"} ${line}`);
        if (!r.passed) failed.push(line);
      }
    }
    expect(failed).toEqual([]);
  });
});
