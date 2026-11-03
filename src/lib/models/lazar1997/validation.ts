import { linspace } from "#lib/validation/helpers.js";
import type {
  Annotation,
  Collect,
  GoldenSeries,
  LinePlot,
  LineSeries,
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

const LOG_TICKS = [1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1];
const DASHDOTDOT = [3, 1, 1, 1, 1, 1];
const LEGEND_TITLE = "decrease of the rate constants [%]";
const RF = "rFJ, rFI";

/** O, J, I and P written just above `curve`'s F at the steps found on `base`. */
const stepLetters = (curve: string, base: string): Annotation[] =>
  ["O", "J", "I", "P"].map((text, k) => {
    const t = `nth(${base}.OJIP.time, ${k})`;
    return {
      text,
      x: t,
      y: `at(${curve}.F, ${t}, ${curve}.time) + 0.02`,
      align: "center",
    };
  });

interface Curve {
  id: string;
  label: string;
  dash: LineSeries["dash"];
}

/** The black fluorescence curves of Figures 5 to 7, in the notebook's order. */
const curves = (
  list: Curve[],
  letters: Annotation[],
  yLim: [number, number],
  yTicks?: number[],
): Plot => ({
  type: "line",
  x: `${list[0].id}.time`,
  y: list.map((c) => ({
    of: `${c.id}.F`,
    x: `${c.id}.time`,
    label: c.label,
    color: "black",
    dash: c.dash,
  })),
  xLabel: "time [s]",
  yLabel: "fluorescence intensity [rel. units]",
  logX: true,
  xLim: [1e-5, 5],
  xTicks: LOG_TICKS,
  yLim,
  ...(yTicks ? { yTicks } : {}),
  annotations: letters,
  legend: true,
  legendTitle: LEGEND_TITLE,
});

/** rF_J (squares) and rF_I (circles), black, as the notebook's inset draws them. */
const rFPlot = (
  table: string,
  layout: Partial<LinePlot>,
  scale = 100,
): Plot => ({
  type: "line",
  x: `${table}.x * ${scale}`,
  y: [
    { of: `${table}.rFJ`, label: "rFJ", marker: "s" as const },
    { of: `${table}.rFI`, label: "rFI", marker: "o" as const },
  ].map((line) => ({ ...line, color: "black", markerSize: 3.5 })),
  yLabel: RF,
  legend: true,
  ...layout,
});

const figure = (
  id: string,
  title: string,
  scenarios: Record<string, Scenario>,
  xs: number[],
  ids: string[],
  plots: Plot[],
  ends = ids[0],
  steps = ends,
  extraOjip: string[] = [],
): Validation => {
  const golden: Record<string, GoldenSeries> = Object.fromEntries(
    ids.map((s) => [`F_${s}`, { x: `${s}.time`, y: `${s}.F` }]),
  );
  golden.rFJ = { x: "rF.x", y: "rF.rFJ" };
  golden.rFI = { x: "rF.x", y: "rF.rFI" };
  return {
    id,
    title,
    // The notebook's inset sits in the main plot; here it is a second panel.
    columns: plots.length,
    simulate: course,
    scenarios,
    ops: [...new Set([ends, steps, ...extraOjip])].map(ojip),
    collect: { rF: rF(ids, xs, ends, steps) },
    plots,
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
const FIG2_STYLE: Record<string, Pick<LineSeries, "label" | "dash">> = {
  y2: { label: "Q_A⁻Q_B" },
  y4: { label: "Q_A⁻Q_B⁻" },
  y6: { label: "Q_A⁻Q_B²⁻", dash: DASHDOTDOT },
  y8: { label: "Q_A⁻Q_BH₂", dash: "dashed" },
  y14: { label: "Q_A⁻N", dash: [1, 10] },
  y15: { label: "Q_A⁻I", dash: "dotted" },
  y12: { label: "Q_A⁻R", dash: [3, 5, 1, 5] },
};

const pct = (a: number) => `${Math.round(a * 100)}%`;

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
        y: LABELLED.map((c) => ({
          of: `run.${c}`,
          ...(FIG2_STYLE[c] ?? {}),
          color: "black",
        })),
        logX: true,
        xLim: [1e-5, 5],
        xTicks: LOG_TICKS,
        yLim: [-0.01, 1],
        annotations: stepLetters("run", "run"),
        legend: true,
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
    [
      curves(
        // The notebook's order: 0, 90, 77, 50 and 100 %.
        [0, 3, 2, 1, 4].map((i) => ({
          id: `f${i}`,
          label: pct(fig5Factors[i]),
          dash: (["solid", "dashed", "dotted", "dashdot", DASHDOTDOT] as const)[
            i
          ],
        })),
        stepLetters("f0", "f0"),
        [-0.01, 1],
      ),
      rFPlot("rF", {
        xLabel: LEGEND_TITLE,
        xLim: [-10, 110],
        xTicks: linspace(0, 100, 6),
        yLim: [0.3, 1.1],
        yTicks: linspace(0.4, 1, 4),
      }),
    ],
  ),
  figure(
    "fig6",
    "Figure 6: inactive centres",
    {
      ...family("a", fig6Amounts.length, (i) => ({
        initial: damaged(fig6Amounts[i]),
      })),
      // The unchanged model, where the notebook finds the letters' times.
      base: {},
    },
    fig6Amounts,
    ids("a", fig6Amounts.length),
    [
      curves(
        // Largest share first, as the notebook draws them.
        [4, 3, 2, 1, 0].map((i) => ({
          id: `a${i}`,
          label: pct(fig6Amounts[i]),
          dash: (["solid", "dashed", "dotted", "dashdot", DASHDOTDOT] as const)[
            i
          ],
        })),
        // The notebook places the letters at Figure 5's step times, on the 25 % curve.
        stepLetters("a1", "base"),
        [-0.01, 0.95],
      ),
      rFPlot("rF", {
        xLabel: LEGEND_TITLE,
        xLim: [-10, 110],
        xTicks: linspace(0, 100, 6),
        yLim: [0.1, 1.1],
        yTicks: linspace(0.2, 1, 5),
      }),
    ],
    // The notebook locates the steps on the 25 % curve.
    "a1",
    "a1",
    ["base"],
  ),
  figure(
    "fig7",
    "Figure 7: decreasing the donor-side constants",
    family("f", fig7Factors.length, (i) => ({
      parameters: scaled(K, 1 - fig7Factors[i]),
    })),
    fig7Factors,
    ids("f", fig7Factors.length),
    [
      curves(
        fig7Factors.map((a, i) => ({
          id: `f${i}`,
          label: pct(a),
          dash: (["solid", "dashed", "dotted", "dashdot"] as const)[i],
        })),
        stepLetters("f0", "f0"),
        [0, 0.85],
        linspace(0, 0.8, 5),
      ),
      rFPlot("rF", {
        xLabel: LEGEND_TITLE,
        xLim: [-5, 50],
        xTicks: linspace(0, 40, 5),
        yLim: [0.2, 0.7],
        yTicks: linspace(0.2, 0.6, 3),
      }),
    ],
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
    [
      rFPlot(
        "rF",
        {
          xLabel: "degree of damage by herbicide action",
          xLim: [-0.5, 7.5],
          xTicks: linspace(0, 7, 8),
          yLim: [0.3, 1.1],
          yTicks: linspace(0.4, 1, 4),
        },
        1,
      ),
    ],
    "d0",
    // The notebook takes J and I from Figure 6's undamaged curve; see curatornotes.md.
    "undamaged",
  ),
];
