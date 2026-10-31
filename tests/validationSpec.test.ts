import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { evaluate, parse, refs, toPython } from "../src/lib/validation/expr";
import { OPS, type Frame } from "../src/lib/validation/ops";
import { protocolGrid } from "../src/lib/validation/run";
import { compareSeries } from "../src/lib/validation/compare";
import type { Validation } from "../src/lib/validation/types";
import { derivedKeys } from "../src/lib/utils";

const MODELS = fileURLToPath(new URL("../src/lib/models", import.meta.url));
const slugs = readdirSync(MODELS).filter((slug) =>
  existsSync(`${MODELS}/${slug}/validation.ts`),
);

describe("expressions", () => {
  const resolve = (path: string[]) =>
    path[0] === "a" ? [1, 2, 3] : path[0] === "k" ? 2 : [10, 100, 1000];

  it.each([
    ["a * k + 1", [3, 5, 7]],
    ["-k ^ 2", -4],
    ["2 ^ 3 ^ 2", 512],
    ["log10(b)", [1, 2, 3]],
    ["mean(a)", 2],
    ["std(a)", 1],
    ["last(a) - first(a)", 2],
    ["at(b, 2.2, a)", 100],
    ["(a - a) / k", [0, 0, 0]],
    ["1e-6 * 1e6", 1],
  ])("%s", (src, want) => {
    expect(evaluate(parse(src), resolve)).toEqual(want);
  });

  it.each(["a +", "nope(a)", "(a", "a b", "a $ b"])("rejects %s", (src) => {
    expect(() => parse(src)).toThrow();
  });

  it("refuses to broadcast columns of different lengths", () => {
    expect(() =>
      evaluate(parse("a + b"), (p) => (p[0] === "a" ? [1] : [1, 2])),
    ).toThrow(/length mismatch/);
  });

  it("keeps precedence when translated to Python", () => {
    expect(toPython(parse("-(a + 1) ^ 2"), (p) => p.join("."))).toBe(
      "(-((a + 1) ** 2))",
    );
  });
});

describe("ops match the numpy/scipy reference", () => {
  type Case = {
    op: string;
    args: Record<string, unknown>;
    frame: Frame;
    protocol?: Array<[number, Record<string, number>]>;
    expected: Frame;
  };
  const cases = JSON.parse(
    readFileSync(
      new URL("./fixtures/validation-ops.json", import.meta.url),
      "utf8",
    ),
  ) as Case[];

  it("covers every op", () => {
    expect(new Set(cases.map((c) => c.op))).toEqual(new Set(Object.keys(OPS)));
  });

  it.each(cases.map((c, i) => [`${c.op} #${i}`, c] as const))("%s", (_, c) => {
    const out = OPS[c.op].run(c.args, {
      column: (name) => c.frame[name],
      protocol: c.protocol?.map(([duration, set]) => ({ duration, set })),
    });
    for (const [col, want] of Object.entries(c.expected)) {
      expect(out[col]).toHaveLength(want.length);
      want.forEach((v, i) => expect(out[col][i]).toBeCloseTo(v, 9));
    }
  });
});

describe("comparison", () => {
  it("reports the relative error against the golden's range", () => {
    const { relativeError, atX } = compareSeries([0, 1], [1, 3.5], {
      x: [0, 1],
      y: [1, 3],
    });
    expect(relativeError).toBeCloseTo(0.25);
    expect(atX).toBe(1);
  });

  it("fails on NaN", () => {
    const { relativeError } = compareSeries([0, 1], [1, NaN], {
      x: [0, 1],
      y: [1, 3],
    });
    expect(relativeError).toBeNaN();
  });

  it("fails when a golden sample was not simulated", () => {
    expect(() =>
      compareSeries([0, 1], [1, 3], { x: [0, 0.5], y: [1, 3] }),
    ).toThrow(/No simulated point/);
  });
});

it("samples protocols like MxlPy's time_points_per_step", () => {
  expect(
    protocolGrid(
      [
        { duration: 1, set: {} },
        { duration: 2, set: {} },
      ],
      2,
    ),
  ).toEqual([0, 0.5, 1, 2, 3]);
});

type Builder = {
  parameters: Map<string, unknown>;
  variables: Map<string, unknown>;
  reactions: Map<string, unknown>;
  sortDependencies(): string[];
  sortReadoutDependencies(): string[];
};

describe.runIf(slugs.length > 0).each(slugs)("%s validation.ts", (slug) => {
  it("only refers to ids its model defines", async () => {
    const { initModel } = (await import(`${MODELS}/${slug}/model.ts`)) as {
      initModel(): Builder;
    };
    const { validations } = (await import(
      `${MODELS}/${slug}/validation.ts`
    )) as { validations: Validation[] };
    const model = initModel();
    const columns = new Set([
      "time",
      ...model.variables.keys(),
      ...derivedKeys(model),
    ]);
    const missing: string[] = [];

    for (const v of validations) {
      const at = `${v.id}`;
      const ids = Object.keys(v.scenarios);
      const opNames = new Set((v.ops ?? []).map((o) => o.as));
      const eachNames = new Set(Object.keys(v.deriveEach ?? {}));
      const derived = new Set(Object.keys(v.derive ?? {}));

      const scenarioRef = (path: string[]) =>
        path[0] === "param" ||
        path[0] === "init" ||
        opNames.has(path[0]) ||
        (path.length === 1 && (columns.has(path[0]) || eachNames.has(path[0])));
      const globalRef = (path: string[]) =>
        (path.length === 1 && derived.has(path[0])) ||
        path[0] === "param" ||
        path[0] === "init" ||
        (ids.includes(path[0]) && scenarioRef(path.slice(1)));

      const check = (
        where: string,
        src: string,
        ok: (path: string[]) => boolean,
      ) => {
        for (const path of refs(parse(src))) {
          if (!ok(path)) missing.push(`${at} ${where}: ${path.join(".")}`);
        }
      };

      for (const [id, s] of Object.entries(v.scenarios)) {
        for (const key of Object.keys(s.parameters ?? {})) {
          if (!model.parameters.has(key)) {
            missing.push(`${at} ${id} parameter: ${key}`);
          }
        }
        for (const key of Object.keys(s.initial ?? {})) {
          if (!model.variables.has(key)) {
            missing.push(`${at} ${id} initial: ${key}`);
          }
        }
        for (const e of s.edits ?? []) {
          if ("removeReaction" in e && !model.reactions.has(e.removeReaction)) {
            missing.push(`${at} ${id} edit: ${e.removeReaction}`);
          }
        }
      }
      for (const op of v.ops ?? []) {
        if (!(op.op in OPS)) missing.push(`${at} op: ${op.op}`);
      }
      for (const [name, src] of Object.entries(v.deriveEach ?? {})) {
        check(`deriveEach.${name}`, src, scenarioRef);
      }
      for (const [name, src] of Object.entries(v.derive ?? {})) {
        check(`derive.${name}`, src, globalRef);
      }
      for (const plot of v.plots) {
        check("plot.x", plot.x, globalRef);
        for (const s of plot.y) {
          check("plot.y", s.of, globalRef);
          if (s.x) check("plot.y.x", s.x, globalRef);
        }
      }
      for (const [name, g] of Object.entries(v.golden ?? {})) {
        check(`golden.${name}.x`, g.x, globalRef);
        check(`golden.${name}.y`, g.y, globalRef);
      }
    }
    expect(missing).toEqual([]);
  });

  it("has a golden for every declared series", async () => {
    const { validations } = (await import(
      `${MODELS}/${slug}/validation.ts`
    )) as { validations: Validation[] };
    const golden = JSON.parse(
      readFileSync(`${MODELS}/${slug}/validation.golden.json`, "utf8"),
    ) as Record<string, Record<string, unknown>>;
    for (const v of validations) {
      expect(Object.keys(golden[v.id] ?? {}).sort()).toEqual(
        Object.keys(v.golden ?? {}).sort(),
      );
    }
  });
});
