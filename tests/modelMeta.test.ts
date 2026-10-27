import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { ModelMeta, PlotLayout } from "../src/lib/types";
import { derivedKeys } from "../src/lib/utils";

// Every id a model's meta.ts refers to must exist in its model.ts, and every
// series it plots must be one a simulation returns (a variable or a derived
// key): the shared models are generated from mxl-models, so a renamed id there
// would otherwise silently drop a series or break an analysis.

const MODELS = fileURLToPath(new URL("../src/lib/models", import.meta.url));
const slugs = readdirSync(MODELS).filter((slug) =>
  existsSync(`${MODELS}/${slug}/meta.ts`),
);

type Builder = Parameters<typeof derivedKeys>[0] & {
  parameters: Map<string, unknown>;
  variables: Map<string, unknown>;
  getDisplayNames(): Map<string, string>;
  buildJsDerived(): { allDerived: string };
  resolveInitialValues(): number[];
  resolveParameters(): number[];
};

/** Plot groups match series labels: display names, possibly normalised, and the NPQ overlay. */
function labels(model: Builder, series: string[]): Set<string> {
  const names = model.getDisplayNames();
  const out = new Set(["NPQ"]);
  for (const key of series) {
    const name = names.get(key) ?? key;
    out.add(name);
    out.add(`Norm(${name})`);
  }
  return out;
}

function groups(plot: PlotLayout | undefined): string[] {
  return plot?.type === "grid" ? plot.groups.flat() : [];
}

describe.each(slugs)("%s meta.ts", (slug) => {
  it("only refers to ids its model.ts defines", async () => {
    const { initModel } = (await import(`${MODELS}/${slug}/model.ts`)) as {
      initModel(): Builder;
    };
    const { meta } = (await import(`${MODELS}/${slug}/meta.ts`)) as {
      meta: ModelMeta;
    };
    const model = initModel();
    const series = new Set([...model.variables.keys(), ...derivedKeys(model)]);
    const plotLabels = labels(model, [...series]);
    const missing: string[] = [];
    const check = (where: string, ok: (k: string) => boolean, keys: string[]) =>
      missing.push(...keys.filter((k) => !ok(k)).map((k) => `${where}: ${k}`));

    meta.analyses.forEach((a, i) => {
      const at = `analyses[${i}] (${a.type})`;
      const isSeries = (k: string) => series.has(k);
      if (a.type === "sweep") {
        check(`${at}.parameter`, (k) => model.parameters.has(k), [a.parameter]);
        check(`${at}.selectedKeys`, isSeries, a.selectedKeys ?? []);
      } else {
        check(`${at}.variables`, isSeries, a.variables ?? []);
      }
      if (a.type === "pam") {
        check(`${at}.ppfdKey`, (k) => model.parameters.has(k), [a.ppfdKey]);
        check(`${at}.fluoKey`, isSeries, a.fluoKey ? [a.fluoKey] : []);
      }
      check(`${at}.normalizedKeys`, isSeries, a.normalizedKeys ?? []);
      check(`${at}.plot.groups`, (k) => plotLabels.has(k), groups(a.plot));
    });
    expect(missing).toEqual([]);
  });

  it("returns one derived column per derived key", async () => {
    // The charts read derived column i as derivedKeys(model)[i].
    const { initModel } = (await import(`${MODELS}/${slug}/model.ts`)) as {
      initModel(): Builder;
    };
    const model = initModel();
    const { allDerived } = model.buildJsDerived();
    const fn = new Function(`return ${allDerived}`)() as (
      t: number,
      y: number[],
      p: number[],
    ) => number[];
    const row = fn(0, model.resolveInitialValues(), model.resolveParameters());
    expect(row).toHaveLength(derivedKeys(model).length);
  });
});
