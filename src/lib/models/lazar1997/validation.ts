import { linspace } from "#lib/validation/helpers.js";
import type {
  Collect,
  GoldenSeries,
  Plot,
  Scenario,
  Validation,
} from "#lib/validation/types.js";

const course = {
  kind: "timeCourse",
  tEval: linspace(0.5e-4, 1, 100000),
} as const;

/** Fluorescence at step `k` of O, J, I, P, whose times come from `base`. */
const at = (id: string, base: string, k: number) =>
  `at(${id}.F, nth(${base}.OJIP.time, ${k}), ${id}.time)`;
/** `ends` gives the O and P times, `steps` the J and I times. */
const relative = (id: string, ends: string, steps: string, k: number) =>
  `(${at(id, steps, k)} - ${at(id, ends, 0)}) / (${at(id, ends, 3)} - ${at(id, ends, 0)})`;

function rF(ids: string[], x: number[], ends: string, steps: string): Collect {
  return {
    x,
    columns: {
      rFJ: ids.map((id) => relative(id, ends, steps, 1)),
      rFI: ids.map((id) => relative(id, ends, steps, 2)),
    },
  };
}

const ojip = (scenario: string) => ({
  op: "ojip",
  as: "OJIP",
  of: "F",
  sigma: 3,
  scenario,
});

const curves = (ids: string[], labels: string[]): Plot => ({
  type: "line",
  x: `${ids[0]}.time`,
  y: ids.map((id, i) => ({ of: `${id}.F`, label: labels[i] })),
  xLabel: "Time (s)",
  yLabel: "Fluorescence intensity (rel. units)",
  logX: true,
  xLim: [1e-5, 5],
  yLim: [-0.01, 1],
});

const rFPlot = (table: string, xLabel: string): Plot => ({
  type: "line",
  x: `${table}.x`,
  y: [
    { of: `${table}.rFJ`, label: "rF J" },
    { of: `${table}.rFI`, label: "rF I" },
  ],
  xLabel,
  yLabel: "rF J, rF I",
});

const figure = (
  id: string,
  title: string,
  scenarios: Record<string, Scenario>,
  xs: number[],
  ids: string[],
  xLabel: string,
  ends = ids[0],
  steps = ends,
): Validation => {
  const golden: Record<string, GoldenSeries> = Object.fromEntries(
    ids.map((s) => [`F_${s}`, { x: `${s}.time`, y: `${s}.F` }]),
  );
  golden.rFJ = { x: "rF.x", y: "rF.rFJ" };
  golden.rFI = { x: "rF.x", y: "rF.rFI" };
  return {
    id,
    title,
    simulate: course,
    scenarios,
    ops: [...new Set([ends, steps])].map(ojip),
    collect: { rF: rF(ids, xs, ends, steps) },
    plots: [curves(ids, xs.map(String)), rFPlot("rF", xLabel)],
    golden,
  };
};

const scaled = (params: string[], factor: number) =>
  Object.fromEntries(params.map((p) => [p, `param.${p} * ${factor}`]));

/** A share `am` of the centres start damaged, keeping y15 where it is. */
const damaged = (am: number) => ({
  y13: `(1 - init.y15) * ${am}`,
  y1: `(1 - init.y15) * ${1 - am}`,
});

const fig5Factors = [0, 0.5, 0.77, 0.9, 1];
const fig5Rates: Record<string, number> = {
  k6: 3500,
  k7: 175,
  k8: 1750,
  k9: 35,
  k16: 150,
  k17: 100,
  k22: 150,
  k23: 100,
};
const fig6Amounts = [0, 0.25, 0.5, 0.75, 1];
const fig7Factors = [0, 0.1, 0.2, 0.4];
const K = ["k1", "k2", "k3", "k4", "k5"];
const fig8: Array<[number, number]> = [
  [1, 0.25],
  [0.9, 0.25],
  [0.8, 0.25],
  [0.8, 0.33],
  [0.8, 0.5],
  [0.8, 0.67],
  [0.8, 0.75],
  [0.8, 1],
];

const ids = (prefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${prefix}${i}`);
const family = (prefix: string, n: number, make: (i: number) => Scenario) =>
  Object.fromEntries(ids(prefix, n).map((id, i) => [id, make(i)]));

const LABELLED = ["F", "y2", "y4", "y6", "y8", "y14", "y15", "y12"];

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: OJIP transient",
    simulate: course,
    scenarios: { run: {} },
    ops: [ojip("run")],
    plots: [
      {
        type: "line",
        x: "run.time",
        y: LABELLED.map((c) => ({ of: `run.${c}`, label: c })),
        xLabel: "Time (s)",
        logX: true,
        xLim: [1e-5, 5],
        yLim: [-0.01, 1],
      },
    ],
    golden: {
      ...Object.fromEntries(
        LABELLED.map((c) => [c, { x: "run.time", y: `run.${c}` }]),
      ),
      steps: { x: "run.OJIP.time", y: "run.OJIP", byIndex: true },
    },
  },
  figure(
    "fig5",
    "Figure 5: decreasing the rate constants",
    family("f", fig5Factors.length, (i) => ({
      parameters: Object.fromEntries(
        Object.entries(fig5Rates).map(([k, v]) => [
          k,
          v * (1 - fig5Factors[i]),
        ]),
      ),
    })),
    fig5Factors,
    ids("f", fig5Factors.length),
    "Decrease of the rate constants",
  ),
  figure(
    "fig6",
    "Figure 6: inactive centres",
    family("a", fig6Amounts.length, (i) => ({
      initial: damaged(fig6Amounts[i]),
    })),
    fig6Amounts,
    ids("a", fig6Amounts.length),
    "Share of inactive centres",
    // The notebook locates the steps on the 25 % curve.
    "a1",
  ),
  figure(
    "fig7",
    "Figure 7: decreasing the donor-side constants",
    family("f", fig7Factors.length, (i) => ({
      parameters: scaled(K, 1 - fig7Factors[i]),
    })),
    fig7Factors,
    ids("f", fig7Factors.length),
    "Decrease of the rate constants",
  ),
  figure(
    "fig8",
    "Figure 8: degree of herbicide damage",
    {
      ...family("d", fig8.length, (i) => ({
        initial: damaged(fig8[i][1]),
        parameters: scaled(K, fig8[i][0]),
      })),
      undamaged: { initial: damaged(0) },
    },
    fig8.map((_, i) => i),
    ids("d", fig8.length),
    "Degree of damage",
    "d0",
    // The notebook takes J and I from Figure 6's undamaged curve; see curatornotes.md.
    "undamaged",
  ),
];
