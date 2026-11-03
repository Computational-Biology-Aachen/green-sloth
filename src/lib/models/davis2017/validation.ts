import { linspace, repeat, step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  LineSeries,
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

/** The notebook's one-hour sine wave at 10 points per second. */
function sineWave() {
  const time = linspace(0, 3600, 36000);
  const raw = time.map((x) => Math.sin((x * 2 * Math.PI) / 3600 - Math.PI / 2));
  const lo = raw.reduce((a, b) => Math.min(a, b));
  const shifted = raw.map((v) => v - lo);
  const hi = shifted.reduce((a, b) => Math.max(a, b));
  return { time, light: shifted.map((v) => (v / hi) * 400) };
}

/** The notebook's square wave: 75 s dark, 150 s at 400, 75 s dark, 1 s ramps. */
function squareWave() {
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
  return {
    time: Array.from({ length: 12 }, (_, k) =>
      time.map((t) => t + k * end),
    ).flat(),
    light: repeat(light, 12),
  };
}

const sineSteps = () => {
  const { time, light } = sineWave();
  return sampledSteps(time, light);
};
const squareSteps = () => {
  const { time, light } = squareWave();
  return sampledSteps(time, light);
};

/**
 * A light pattern for shading, in hours and as a fraction of its peak: the
 * notebook fills it on a hidden twin axis spanning the plot's height. Only the
 * points where the light changes are kept (its `compress_repeats`), and the
 * sine, smooth at any resolution, every 100th.
 */
function shading({ time, light }: { time: number[]; light: number[] }) {
  const peak = light.reduce((a, b) => Math.max(a, b));
  const keep = time.map(
    (_, i) =>
      i === 0 ||
      i === time.length - 1 ||
      light[i] !== light[i - 1] ||
      light[i] !== light[i + 1],
  );
  const every = keep.filter(Boolean).length > 5000 ? 100 : 1;
  const idx = time.map((_, i) => i).filter((i) => keep[i] && i % every === 0);
  return {
    t: idx.map((i) => time[i] / 3600),
    light: idx.map((i) => light[i] / peak),
  };
}
const SINE_LIGHT = shading(sineWave());
const SQUARE_LIGHT = shading(squareWave());

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

const DV = ["Dpsi", "delta_pH_inVolts", "pmf"];

/** Figure 3's rows: a left and a right series each, below the voltages. */
const FIG3_ROWS = [
  {
    left: { of: "k_b6f * 5", color: "#0506fc" },
    right: { of: "pH_lumen", color: "#fb0f1d", dash: "solid" },
    yLabel: "b₆f rate constant (s⁻¹)",
    yRightLabel: "Lumen pH",
    yLim: [0.75, 2.5],
    yTicks: linspace(1, 2.5, 4),
    yRightLim: [5.8, 6.5],
    yRightTicks: linspace(5.8, 6.4, 4),
    scale: ["1 ×10²", undefined],
  },
  {
    left: { of: "NPQ", color: "#107207" },
    right: { of: "K_lu * 1e2", color: "#191919", dash: "solid" },
    yLabel: "NPQ (q_E)",
    yRightLabel: "lumen K⁺ (M)",
    yLim: [-0.1, 4],
    yTicks: linspace(0, 4, 5),
    yRightLim: [0.25, 2.5],
    yRightTicks: linspace(0.5, 2.5, 5),
    scale: [undefined, "1 ×10⁻²"],
  },
  {
    left: { of: "QA_red / 2", color: "#246b18" },
    right: { of: "vPSII_recomb / 4", color: "#fc030f", dash: "solid" },
    yLabel: "Q_A⁻",
    yRightLabel: "¹O₂ (s⁻¹)",
    yLim: [-0.05, 0.39],
    yTicks: linspace(0, 0.3, 4),
    yRightLim: [-1.25, 13.75],
    yRightTicks: linspace(0, 12.5, 6),
    scale: [undefined, undefined],
  },
  {
    left: { of: "LEF * 1e-4", color: "#157814" },
    right: { of: "singO2 * 1e-3", color: "#fb131f", dash: "solid" },
    yLabel: "LEF cumulative",
    yRightLabel: "¹O₂ (cumulative)",
    yLim: [0, 6],
    yTicks: linspace(0, 5, 6),
    yRightLim: [0, 4],
    yRightTicks: linspace(0, 4, 5),
    scale: ["1 ×10⁴", "1 ×10³"],
  },
] as const;

const FIG3_IDS = ["p0", "p1", "p10"];

function fig3Plots(): Plot[] {
  const common = (id: string, col: number, row: number): Partial<LinePlot> => ({
    x: `${id}.time / 60`,
    xLim: [0, 17.5],
    xTicks: linspace(0, 15, 4),
    ...(row === 4 ? { xLabel: "time (min)" } : {}),
    phases: [{ from: 2.5, to: 7.5, color: "red", alpha: 0.15 }],
    annotations: [
      { text: `${"abc"[col]}.${row + 1}`, x: 0.85, y: 0.15, coords: "axes" },
    ],
  });
  const voltages = FIG3_IDS.map((id, col): Plot => ({
    type: "line",
    ...common(id, col, 0),
    x: `${id}.time / 60`,
    y: DV.map((c, k) => ({
      of: `${id}.${c} - first(${id}.${c})`,
      ...(col === 0 ? { label: ["ΔΨ", "ΔpH", "pmf"][k] } : {}),
      color: ["#1e1bfe", "#fa323a", "#0d6806"][k],
      ...(k > 0 ? { dash: "dashed" as const } : {}),
    })),
    // The notebook's label reads "ΔV)".
    ...(col === 0 ? { yLabel: "ΔV" } : {}),
    yLim: [-0.05, 0.125],
    yTicks: col === 0 ? linspace(0, 0.1, 3) : [],
    legend: col === 0,
  }));
  const rows = FIG3_ROWS.flatMap((row, r) =>
    FIG3_IDS.map((id, col): Plot => {
      const base = common(id, col, r + 1);
      const scale = [
        ...(col === 0 && row.scale[0]
          ? [
              {
                text: row.scale[0],
                x: 0,
                y: 1.04,
                coords: "axes" as const,
                color: row.left.color,
                align: "left" as const,
              },
            ]
          : []),
        ...(col === 2 && row.scale[1]
          ? [
              {
                text: row.scale[1],
                x: 1,
                y: 1.04,
                coords: "axes" as const,
                color: row.right.color,
                align: "right" as const,
              },
            ]
          : []),
      ];
      return {
        type: "line",
        ...base,
        x: `${id}.time / 60`,
        y: [
          { of: `${id}.${row.left.of}`, color: row.left.color, dash: "dashed" },
          {
            of: `${id}.${row.right.of}`,
            color: row.right.color,
            axis: "right",
          },
        ],
        ...(col === 0 ? { yLabel: row.yLabel } : {}),
        ...(col === 2 ? { yRightLabel: row.yRightLabel } : {}),
        yColor: row.left.color,
        yRightColor: row.right.color,
        yLim: [...row.yLim],
        yTicks: col === 0 ? [...row.yTicks] : [],
        yRightLim: [...row.yRightLim],
        yRightTicks: col === 2 ? [...row.yRightTicks] : [],
        annotations: [...(base.annotations ?? []), ...scale],
      };
    }),
  );
  // Row by row, as the notebook's 5 x 3 grid.
  return [...voltages, ...rows];
}

const FIG4_IDS = ["normSin", "fastSin", "normSquare", "fastSquare"];

/** Figure 4's light, filled up to the plot's top at its peak. */
const lightFill = (id: string, lim: [number, number]): LineSeries => {
  const light = id.endsWith("Sin") ? "sinLight" : "squareLight";
  const t = id.endsWith("Sin") ? "sinT" : "squareT";
  return {
    of: `${lim[0]} + ${lim[1] - lim[0]} * data.${light}`,
    x: `data.${t}`,
    fillTo: `data.${t} * 0 + ${lim[0]}`,
    color: "red",
    alpha: 0.25,
    lineWidth: 0,
  };
};

function fig4Plots(): Plot[] {
  const voltages = FIG4_IDS.map((id, col): Plot => ({
    type: "line",
    x: `${id}.time / 3600`,
    y: [
      lightFill(id, [-0.05, 0.15]),
      ...DV.map((c, k) => ({
        of: `${id}.${c} - first(${id}.${c})`,
        ...(col === 0 ? { label: ["ΔΨ", "ΔpH", "pmf"][k] } : {}),
        color: ["blue", "red", "green"][k],
      })),
    ],
    xLabel: "Time (h)",
    ...(col === 0 ? { yLabel: "ΔV" } : {}),
    yLim: [-0.05, 0.15],
    ...(col === 0 ? {} : { yTicks: [] }),
    legend: col === 0,
  }));
  const damage = FIG4_IDS.map((id, col): Plot => ({
    type: "line",
    x: `${id}.time / 3600`,
    y: [
      lightFill(id, [0, 320000]),
      { of: `${id}.LEF`, color: "green" },
      { of: `${id}.singO2`, color: "red", axis: "right" },
    ],
    xLabel: "Time (h)",
    ...(col === 0 ? { yLabel: "LEF cumulative" } : { yTicks: [] }),
    ...(col === 3 ? { yRightLabel: "1O2 (cummulative)" } : { yRightTicks: [] }),
    yRightColor: "red",
    yLim: [0, 320000],
    yRightLim: [0, 29500],
  }));
  return [...voltages, ...damage];
}

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
    columns: 3,
    simulate: pulse(150),
    scenarios: {
      p0: { initial: Y_FAST, parameters: { P_K: "param.P_K * 0" } },
      p1: { initial: Y_NORMAL },
      p10: { initial: Y_FAST, parameters: { P_K: "param.P_K * 10" } },
    },
    plots: fig3Plots(),
    golden: goldenOf(FIG3_IDS, FIG3),
  },
  {
    id: "fig4",
    title: "Figure 4: fluctuating light",
    columns: 4,
    data: {
      sinT: SINE_LIGHT.t,
      sinLight: SINE_LIGHT.light,
      squareT: SQUARE_LIGHT.t,
      squareLight: SQUARE_LIGHT.light,
    },
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
    plots: fig4Plots(),
    golden: goldenOf(FIG4_IDS, ["Dpsi", "pmf", "LEF", "singO2"]),
  },
  {
    id: "fig5",
    title: "Figure 5: onset of light",
    columns: 3,
    simulate: pulse(60),
    scenarios: {
      zero: { initial: Y_FAST, parameters: { P_K: 0 } },
      norm: { initial: Y_NORMAL },
      fast: { initial: Y_FAST, parameters: { P_K: 60000 } },
      veryFast: { initial: Y_FAST, parameters: { P_K: 600000 } },
    },
    ops: DEFICIT,
    plots: (
      [
        ["v_VKC", "K+ flux (mol mol⁻¹ PSII s⁻¹)", ""],
        ["deficit", "proton deficit (fraction)", " * 5"],
        ["deficit_int", "ATP deficit (cummulative)", " / 2"],
      ] as const
    ).map(([c, yLabel, factor], k): Plot => ({
      type: "line",
      x: "zero.time - 60",
      // The notebook's window: 59 s < t < 85 s, from the light's onset.
      y: WINDOW.map((id, i) => ({
        of: `${id}.${c}${factor}`,
        x: `${id}.time - 60`,
        xRange: [-1 + 1e-9, 25 - 1e-9] as [number, number],
        label: `P = ${[0, 1, 10, 100][i]}X`,
        color: ["red", "orange", "green", "blue"][i],
      })),
      // The notebook's x label reads " Time s()".
      xLabel: "Time (s)",
      yLabel,
      ...(k === 1 ? { yLim: [-25, 450] as [number, number] } : {}),
      legend: k === 1,
    })),
    golden: goldenOf(WINDOW, ["v_VKC", "deficit", "deficit_int"]),
  },
];
