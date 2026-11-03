/**
 * Every model's validations are valid mxl-schemas analysis documents, and the
 * vendored schema and the expression engine match mxl-schemas' own copy and
 * fixtures, when the meta-repo checkout has them next to this repo.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import schema from "../src/lib/validation/analysis.schema.json";
import { nodeFromJson } from "@computational-biology-aachen/mxlweb-core/mathml";
import { evaluate, parse } from "../src/lib/validation/expr";
import {
  modelKind,
  toAnalysisDocument,
} from "../src/lib/validation/export/analysis";
import type { Validation } from "../src/lib/validation/types";

const MODELS = fileURLToPath(new URL("../src/lib/models", import.meta.url));
const SCHEMAS = fileURLToPath(
  new URL("../../../misc/mxl-schemas", import.meta.url),
);
const hasSchemas = existsSync(`${SCHEMAS}/v1/analysis.schema.json`);
const slugs = readdirSync(MODELS).filter((slug) =>
  existsSync(`${MODELS}/${slug}/validation.ts`),
);

const validate = new Ajv2020({ strict: false, allErrors: true }).compile(
  schema,
);
const readJson = (path: string) =>
  JSON.parse(readFileSync(path, "utf8")) as unknown;

describe.each(slugs)("%s", (slug) => {
  it("is a valid analysis document", async () => {
    const { initModel } = (await import(`${MODELS}/${slug}/model.ts`)) as {
      initModel(): Parameters<typeof modelKind>[0];
    };
    const { validations } = (await import(
      `${MODELS}/${slug}/validation.ts`
    )) as { validations: Validation[] };
    const doc = toAnalysisDocument(slug, modelKind(initModel()), validations);
    validate(doc);
    expect(validate.errors ?? []).toEqual([]);
  });
});

describe.runIf(hasSchemas)("mxl-schemas", () => {
  it("vendored analysis schema matches mxl-schemas", () => {
    expect(schema).toEqual(readJson(`${SCHEMAS}/v1/analysis.schema.json`));
  });

  type Case = { name: string; valid: boolean; document: unknown };
  const { cases } = (
    hasSchemas ? readJson(`${SCHEMAS}/tests/analysis.fixtures.json`) : {}
  ) as { cases: Case[] };
  it.each((cases ?? []).map((c) => [c.name, c] as const))(
    "analysis fixture: %s",
    (_, c) => {
      expect(validate(c.document)).toBe(c.valid);
    },
  );

  type Expressions = {
    columns: Record<string, number | number[]>;
    cases: Array<{ src: string; tree: unknown; value: number | number[] }>;
    errors: string[];
  };
  const expressions = (
    hasSchemas ? readJson(`${SCHEMAS}/tests/expressions.fixtures.json`) : {}
  ) as Expressions;
  it.each((expressions.cases ?? []).map((c) => [c.src, c] as const))(
    "expression %s",
    (_, c) => {
      // The string parses to the stored tree, and the tree evaluates to `value`.
      expect(parse(c.src).toJson()).toEqual(c.tree);
      const tree = nodeFromJson(c.tree as Parameters<typeof nodeFromJson>[0]);
      const got = evaluate(tree, (path) => {
        const v = expressions.columns[path.join(".")];
        if (v === undefined) throw new Error(`Unknown ${path.join(".")}`);
        return v;
      });
      if (Array.isArray(c.value)) {
        expect(got).toHaveLength(c.value.length);
        c.value.forEach((v, i) =>
          expect((got as number[])[i]).toBeCloseTo(v, 12),
        );
      } else {
        expect(got).toBeCloseTo(c.value, 12);
      }
    },
  );
  it.each(expressions.errors ?? [])("rejects expression %s", (src) => {
    expect(() => parse(src)).toThrow();
  });
});
