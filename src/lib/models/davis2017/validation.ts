import { linspace, repeat, step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  OpSpec,
  Plot,
  ProtocolStep,
  Validation,
} from "#lib/validation/types.js";

const ZEROED = {
  P700_ox: 0,
  Fd_red: 0,
  NADPH_st: 0,
  LEF: 0,
  ATP_made: 0,
};
const Y_NORMAL = {
  QA_red: 5.511496362768013e-6,
  PQH_2: 0.006610917859794705,
  pH_lumen: 6.455489733520293,
  Dpsi: 0.014066213897372587,
  K_lu: 0.023314403407362544,
  PC_ox: 1.6965704506492556,
  Zx: 0.0735694070105809,
  singO2: 0.38023965479069094,
  ...ZEROED,
};
const Y_FAST = {
  QA_red: 1.6680442448215374e-5,
  PQH_2: 0.01996349863700503,
  pH_lumen: 6.455422734896244,
  Dpsi: 0.014062169675170863,
  K_lu: 0.023317976223034567,
  PC_ox: 1.2976782989183835,
  Zx: 0.07361151276346266,
  singO2: 0.2874820769637723,
  ...ZEROED,
};

const pulse = (dark: number) => ({
  kind: "protocol" as const,
  pointsPerStep: 10000,
  steps: [
    step(dark, { PPFD: 0 }),
    step(300, { PPFD: 300 }),
    step(600, { PPFD: 0 }),
  ],
});

/** The notebook's one-hour sine wave, sampled every 10 s. */
function sineSteps(): ProtocolStep[] {
  const t = linspace(0, 3600, 36000);
  const raw = t.map((x) => Math.sin((x * 2 * Math.PI) / 3600 - Math.PI / 2));
  const lo = raw.reduce((a, b) => Math.min(a, b));
  const shifted = raw.map((v) => v - lo);
  const hi = shifted.reduce((a, b) => Math.max(a, b));
  const light = shifted.map((v) => (v / hi) * 400);
  return sampledSteps(t, light);
}

/** The notebook's square wave: 75 s dark, 150 s at 400, 75 s dark, 1 s ramps. */
function squareSteps(): ProtocolStep[] {
  const time = [
    ...linspace(0, 75, 7500),
    ...linspace(75, 76, 100),
    ...linspace(76, 226, 15000),
    ...linspace(226, 227, 100),
    ...linspace(227, 302, 7500),
  ];
  const light = [
    ...linspace(0, 0, 7500),
    ...linspace(0, 400, 100),
    ...linspace(400, 400, 15000),
    ...linspace(400, 0, 100),
    ...linspace(0, 0, 7500),
  ];
  const end = time[time.length - 1];
  const times = Array.from({ length: 12 }, (_, k) =>
    time.map((t) => t + k * end),
  ).flat();
  return sampledSteps(times, repeat(light, 12));
}

/** Every 100th sample becomes one step, lit by its ending value. */
function sampledSteps(time: number[], light: number[]): ProtocolStep[] {
  const t = time.filter((_, i) => i % 100 === 0);
  const l = light.filter((_, i) => i % 100 === 0);
  return t.slice(1).map((end, i) => step(end - t[i], { PPFD: l[i + 1] }));
}

const FIG3 = [
  "Dpsi",
  "delta_pH_inVolts",
  "pmf",
  "k_b6f",
  "pH_lumen",
  "NPQ",
  "K_lu",
  "QA_red",
  "vPSII_recomb",
  "LEF",
  "singO2",
];

const goldenOf = (ids: string[], columns: string[]) => {
  const out: Record<string, GoldenSeries> = {};
  for (const id of ids) {
    for (const c of columns) {
      out[`${c}_${id}`] = { x: `${id}.time`, y: `${id}.${c}` };
    }
  }
  return out;
};

const panels = (id: string, title: string): Plot[] => [
  {
    type: "line",
    title: `${title}: voltages`,
    x: `${id}.time`,
    y: ["Dpsi", "delta_pH_inVolts", "pmf"].map((c) => ({
      of: `${id}.${c} - first(${id}.${c})`,
      label: c,
    })),
    xLabel: "Time (s)",
    yLabel: "ΔV",
    yLim: [-0.05, 0.15],
  },
  {
    type: "line",
    title: `${title}: photodamage`,
    x: `${id}.time`,
    y: [
      { of: `${id}.LEF`, label: "LEF cumulative" },
      { of: `${id}.singO2`, label: "¹O₂ cumulative", axis: "right" },
    ],
    xLabel: "Time (s)",
    yLabel: "LEF cumulative",
    yRightLabel: "¹O₂ cumulative",
  },
];

const DEFICIT: OpSpec[] = [
  { op: "diff", as: "LEF_to_NADPH", of: "LEF", into: true },
  { op: "diff", as: "ATP_rate", of: "ATP_made", into: true },
  {
    op: "column",
    as: "deficit",
    expr: `LEF_to_NADPH * ${3 / 4.666} - ATP_rate`,
  },
  { op: "cumTrapz", as: "deficit_int", of: "deficit", into: true },
];

const WINDOW = ["zero", "norm", "fast", "veryFast"];

export const validations: Validation[] = [
  {
    id: "fig3",
    title: "Figure 3: light pulse across P_K",
    simulate: pulse(150),
    scenarios: {
      p0: { initial: Y_FAST, parameters: { P_K: "param.P_K * 0" } },
      p1: { initial: Y_NORMAL },
      p10: { initial: Y_FAST, parameters: { P_K: "param.P_K * 10" } },
    },
    plots: ["p0", "p1", "p10"].map((id): Plot => ({
      type: "line",
      title: id,
      x: `${id}.time`,
      y: ["Dpsi", "delta_pH_inVolts", "pmf"].map((c) => ({
        of: `${id}.${c} - first(${id}.${c})`,
        label: c,
      })),
      xLabel: "Time (s)",
      yLabel: "ΔV",
      yLim: [-0.05, 0.125],
      phases: [{ from: 150, to: 450 }],
    })),
    golden: goldenOf(["p0", "p1", "p10"], FIG3),
  },
  {
    id: "fig4",
    title: "Figure 4: fluctuating light",
    scenarios: {
      normSin: {
        initial: Y_NORMAL,
        parameters: { P_K: 1200 },
        simulate: { kind: "protocol", steps: sineSteps() },
      },
      fastSin: {
        initial: Y_FAST,
        parameters: { P_K: 180000 },
        simulate: { kind: "protocol", steps: sineSteps() },
      },
      normSquare: {
        initial: Y_NORMAL,
        parameters: { P_K: 1200 },
        simulate: { kind: "protocol", steps: squareSteps() },
      },
      fastSquare: {
        initial: Y_FAST,
        parameters: { P_K: 180000 },
        simulate: { kind: "protocol", steps: squareSteps() },
      },
    },
    plots: [
      ...panels("normSin", "Sine, 0.2x P_K"),
      ...panels("fastSin", "Sine, 30x P_K"),
      ...panels("normSquare", "Square, 0.2x P_K"),
      ...panels("fastSquare", "Square, 30x P_K"),
    ],
    golden: goldenOf(
      ["normSin", "fastSin", "normSquare", "fastSquare"],
      ["Dpsi", "pmf", "LEF", "singO2"],
    ),
  },
  {
    id: "fig5",
    title: "Figure 5: onset of light",
    simulate: pulse(60),
    scenarios: {
      zero: { initial: Y_FAST, parameters: { P_K: 0 } },
      norm: { initial: Y_NORMAL },
      fast: { initial: Y_FAST, parameters: { P_K: 60000 } },
      veryFast: { initial: Y_FAST, parameters: { P_K: 600000 } },
    },
    ops: DEFICIT,
    plots: [
      ["v_VKC", "K⁺ flux (mol mol⁻¹ PSII s⁻¹)"],
      ["deficit", "Proton deficit"],
      ["deficit_int", "ATP deficit (cumulative)"],
    ].map(([c, yLabel]): Plot => ({
      type: "line",
      x: "zero.time",
      y: WINDOW.map((id, i) => ({
        of: `${id}.${c}`,
        label: `P = ${[0, 1, 10, 100][i]}X`,
      })),
      xLabel: "Time (s)",
      yLabel,
      xLim: [59, 85],
    })),
    golden: goldenOf(WINDOW, ["v_VKC", "deficit", "deficit_int"]),
  },
];
