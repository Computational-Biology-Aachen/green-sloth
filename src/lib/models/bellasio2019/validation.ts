import { linspace, step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LineSeries,
  Plot,
  Scan,
  TimeCourseSimulation,
  Validation,
} from "#lib/validation/types.js";

const PPFD = [50, 75, 100, 150, 200, 500, 1000, 1500];
const CA = [
  400, 300, 200, 120, 100, 80, 60, 40, 400, 400, 400, 400, 500, 650, 850, 1050,
  1300,
];
const O2 = [210000, 20000];
const SCAN_COLUMNS = ["A", "gs", "v_FNR", "RUBP", "PGA", "Ract", "f_rubp"];

/** Each point is a 30 min simulation; only its end state is used. */
const halfHour: TimeCourseSimulation = { kind: "timeCourse", tEval: [1800] };

const seq = (n: number) => Array.from({ length: n }, (_, i) => i);

function scan(param: "PPFD" | "Ca", values: number[]): Scan {
  return {
    over: { Ca: [400], PPFD: [1500], [param]: values, p_o2: O2 },
    grid: true,
    x: seq(values.length * O2.length),
    columns: SCAN_COLUMNS,
    simulate: halfHour,
  };
}

const pfd = scan("PPFD", PPFD);
const ca = scan("Ca", CA);

const AMBIENT = 0;
const LOW = 1;
const O2_STYLE = [
  { color: "#ff7f40", marker: "o", label: "Modelled Ambient O₂" },
  { color: "#0020f2", marker: "v", label: "Modelled Low O₂" },
] as const;

/**
 * The rows of `table` at one oxygen level `k`: the grid varies p_o2 fastest,
 * so they are every other row. As the notebook's `.xs(pO2, level=1)`.
 */
const byO2 = (table: string, values: number[], k: number) => ({
  x: values,
  columns: Object.fromEntries(
    SCAN_COLUMNS.map((c) => [
      c,
      values.map((_, i) => `nth(${table}.${c}, ${i * O2.length + k})`),
    ]),
  ),
});
const o2Tables = {
  pfd0: byO2("pfd", PPFD, AMBIENT),
  pfd1: byO2("pfd", PPFD, LOW),
  ca0: byO2("ca", CA, AMBIENT),
  ca1: byO2("ca", CA, LOW),
};

const PFD_TICKS = [100, 300, 500, 700, 900, 1100, 1300, 1500];
const CA_TICKS = [100, 300, 500, 700, 900, 1100];
const PFD_LABEL = "PPFD / µmol m⁻² s⁻¹";
const LETTERS = "abcdefgh";

/**
 * One response panel: both oxygen levels as hollow markers, the PPFD scan on
 * the left and the Ca scan on the right, as in the paper's Figures 3 and 4.
 */
function responsePanel(
  row: number,
  col: number,
  of: (table: string) => string,
  axis: { yLabel: string; yLim: [number, number]; yTicks: number[] },
  caLabel: string,
  last: boolean,
): Plot {
  const scan = col === 0 ? "pfd" : "ca";
  return {
    type: "line",
    panel: LETTERS[row * 2 + col],
    ...(row === 0
      ? { title: col === 0 ? "Response to PPFD" : "Response to Cₐ" }
      : {}),
    x: `${scan}0.x`,
    y: [AMBIENT, LOW].map((k) => ({
      of: of(`${scan}${k}`),
      x: `${scan}${k}.x`,
      style: "markers" as const,
      color: O2_STYLE[k].color,
      marker: O2_STYLE[k].marker,
      markerFace: "none",
      // Only the first panel has a legend.
      ...(row === 0 && col === 0 ? { label: O2_STYLE[k].label } : {}),
    })),
    ...(last ? { xLabel: col === 0 ? PFD_LABEL : caLabel } : {}),
    xTicks: col === 0 ? PFD_TICKS : CA_TICKS,
    ...axis,
  };
}

const responseFigure = (
  rows: Array<{
    of: (table: string) => string;
    yLabel: string;
    yLim: [number, number];
    yTicks: number[];
  }>,
  caLabel: string,
): Plot[] =>
  rows.flatMap(({ of, ...axis }, row) =>
    [0, 1].map((col) =>
      responsePanel(row, col, of, axis, caLabel, row === rows.length - 1),
    ),
  );

const transientGolden = (ids: string[], columns: string[]) => {
  const out: Record<string, GoldenSeries> = {};
  for (const id of ids) {
    for (const c of columns) {
      out[`${c}_${id}`] = { x: `${id}.t`, y: `${id}.${c}` };
    }
  }
  return out;
};

const TRANSIENT_COLUMNS = ["A", "v_ATPsynth", "gs", "RUBP", "ATP_st"];
const TRANSIENT_PARAMS = {
  vmax_v_RuBisCO_c: 0.18,
  chi_beta: 0.8,
  tau0: -0.12,
  Ki: 3600,
  Kd: 1200,
};
const ACCLIMATION = 400;

const ORANGE = "#fb8234";
const GREEN = "#19bc72";
const BLUE = "#6fe3e2";
const RED = "#dc2b25";
const PINK = "#e293bf";

type Line = Omit<LineSeries, "of"> & { of: (id: string) => string };

const TRANSIENT_ROWS: Record<string, Line> = {
  A: {
    of: (id) => `${id}.A * 1000`,
    label: "Modelled A",
    color: ORANGE,
    lineWidth: 1,
  },
  v_ATP: {
    of: (id) => `${id}.v_ATPsynth / 3 * 1000`,
    label: "v_ATP / 3",
    color: GREEN,
    lineWidth: 2,
  },
  v_NADPH: {
    of: (id) => `${id}.v_FNR / 2 * 1000`,
    label: "v_NADPH / 2",
    color: BLUE,
    dash: "dashdot",
    lineWidth: 1,
  },
  gs: {
    of: (id) => `${id}.gs`,
    label: "Modelled gₛ",
    color: ORANGE,
    lineWidth: 1,
  },
  Ract: {
    of: (id) => `${id}.Ract`,
    label: "Rub. Act. St.",
    color: GREEN,
    dash: "dashdot",
    lineWidth: 1,
  },
  f_rubp: {
    of: (id) => `${id}.f_rubp`,
    label: "f(RuBP)",
    color: BLUE,
    dash: "dashed",
    lineWidth: 1,
  },
  Pi: {
    of: (id) => `${id}.Pi_st`,
    label: "Pi",
    color: RED,
    dash: "dashed",
    lineWidth: 1,
  },
  RuBP: {
    of: (id) => `${id}.RUBP`,
    label: "RuBP",
    color: PINK,
    dash: "dashdot",
    lineWidth: 1,
  },
  PGA: { of: (id) => `${id}.PGA`, label: "PGA", color: GREEN, lineWidth: 2 },
  DHAP: { of: (id) => `${id}.DHAP`, label: "DHAP", color: BLUE, lineWidth: 1 },
  ATP: {
    of: (id) => `${id}.ATP_st / param.AP_tot`,
    label: "[ATP] / Atot",
    color: RED,
    lineWidth: 1,
  },
  NADPH: {
    of: (id) => `${id}.NADPH_st / param.NADP_tot`,
    label: "[NADPH] / Ntot",
    color: BLUE,
    dash: "dashed",
    lineWidth: 1,
  },
};

interface TransientAxes {
  yLabel: string;
  lines: string[];
  /** Per column: [yLim, yTicks]. */
  y: Array<[[number, number], number[]]>;
}

/** Figures 5 and 6: four rows of time courses for each of the two transients. */
function transientPlots(
  ids: string[],
  titles: string[],
  xLims: Array<[number, number]>,
  xTicks: number[][],
  rows: TransientAxes[],
): Plot[] {
  return rows.flatMap((row, r) =>
    ids.map((id, c): Plot => ({
      type: "line",
      panel: LETTERS[r * 2 + c],
      ...(r === 0 ? { title: titles[c] } : {}),
      x: `${id}.t`,
      y: row.lines.map((name) => {
        const { of, ...style } = TRANSIENT_ROWS[name];
        return { of: of(id), ...style };
      }),
      ...(r === rows.length - 1 ? { xLabel: "time / s" } : {}),
      yLabel: row.yLabel,
      xLim: xLims[c],
      xTicks: xTicks[c],
      yLim: row.y[c][0],
      yTicks: row.y[c][1],
      legend: true,
    })),
  );
}

const FLUX = "Flux / µmol m⁻² s⁻¹";
const RATIOS = "gₛ, R_act, f(RuBP)";
const CONC = "Concentration / mM";

export const validations: Validation[] = [
  {
    id: "fig3",
    title: "Figure 3: response to PPFD and Ca",
    columns: 2,
    scans: { pfd, ca },
    collect: o2Tables,
    plots: responseFigure(
      [
        {
          of: (t) => `${t}.A * 1000`,
          yLabel: "A / µmol m⁻² s⁻¹",
          yLim: [0, 40],
          yTicks: linspace(5, 35, 4),
        },
        {
          of: (t) => `${t}.gs`,
          yLabel: "gs / mol m⁻² s⁻¹",
          yLim: [0, 0.5],
          yTicks: linspace(0.05, 0.45, 5),
        },
        {
          of: (t) => `${t}.v_FNR * 1000`,
          yLabel: "v_NADPH / µmol m⁻² s⁻¹",
          yLim: [0, 110],
          yTicks: linspace(20, 100, 5),
        },
      ],
      "Cₐ / µmol mol⁻¹",
    ),
    golden: Object.fromEntries(
      ["pfd", "ca"].flatMap((t) =>
        SCAN_COLUMNS.map((c) => [`${t}_${c}`, { x: `${t}.x`, y: `${t}.${c}` }]),
      ),
    ),
  },
  {
    id: "fig4",
    title: "Figure 4: metabolites and Rubisco activity",
    columns: 2,
    scans: { pfd, ca },
    collect: o2Tables,
    plots: responseFigure(
      [
        {
          of: (t) => `${t}.RUBP * param.V_m * 1000`,
          yLabel: "RuBP / µmol m⁻²",
          yLim: [0, 250],
          yTicks: linspace(50, 200, 4),
        },
        {
          of: (t) => `${t}.PGA * param.V_m * 1000`,
          yLabel: "PGA / µmol m⁻²",
          yLim: [0, 325],
          yTicks: linspace(100, 300, 3),
        },
        {
          of: (t) => `${t}.Ract * ${t}.f_rubp`,
          yLabel: "Rubisco Rel. Activity",
          yLim: [0, 1.1],
          yTicks: linspace(0.2, 1, 5),
        },
      ],
      "Ca / µmol mol⁻¹",
    ),
  },
  {
    id: "fig5",
    title: "Figure 5: light transients",
    deriveEach: { t: `time - ${ACCLIMATION}` },
    scenarios: {
      up: {
        parameters: { Ca: 350, ...TRANSIENT_PARAMS },
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(ACCLIMATION, { PPFD: 50 }), step(1800, { PPFD: 1500 })],
        },
      },
      down: {
        parameters: { Ca: 350, ...TRANSIENT_PARAMS },
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(ACCLIMATION, { PPFD: 1500 }), step(1800, { PPFD: 50 })],
        },
      },
    },
    columns: 2,
    plots: transientPlots(
      ["up", "down"],
      ["50 to 1500 µmol m⁻² s⁻¹ PPFD", "1500 to 50 µmol m⁻² s⁻¹ PPFD"],
      [
        [-100, 1600],
        [-100, 1100],
      ],
      [linspace(0, 1400, 8), linspace(0, 1000, 6)],
      [
        {
          yLabel: FLUX,
          lines: ["A", "v_ATP", "v_NADPH"],
          y: [
            [[0, 55], linspace(10, 50, 5)],
            [[-2, 8], linspace(2, 8, 4)],
          ],
        },
        {
          yLabel: RATIOS,
          lines: ["gs", "Ract", "f_rubp"],
          y: [
            [[0.1, 1], linspace(0.2, 1, 5)],
            [[0, 1], linspace(0.2, 1, 5)],
          ],
        },
        {
          yLabel: CONC,
          lines: ["Pi", "RuBP", "PGA", "DHAP"],
          y: [
            [[0, 9], linspace(2, 8, 4)],
            [[-1, 10], linspace(2, 8, 4)],
          ],
        },
        {
          yLabel: "Ratio",
          lines: ["ATP", "NADPH"],
          y: [
            [[0, 1], linspace(0.2, 0.8, 4)],
            [[-0.1, 1], linspace(0.2, 0.8, 4)],
          ],
        },
      ],
    ),
    golden: transientGolden(["up", "down"], TRANSIENT_COLUMNS),
  },
  {
    id: "fig6",
    title: "Figure 6: Ca transients",
    deriveEach: { t: `time - ${ACCLIMATION}` },
    scenarios: {
      up: {
        parameters: { PPFD: 1500, ...TRANSIENT_PARAMS },
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(ACCLIMATION, { Ca: 350 }), step(500, { Ca: 1500 })],
        },
      },
      down: {
        // The initial Ci follows Ca; the notebook's shared model is at 1500 here.
        parameters: { PPFD: 1500, Ca: 1500, ...TRANSIENT_PARAMS },
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(ACCLIMATION, { Ca: 1500 }), step(500, { Ca: 350 })],
        },
      },
    },
    columns: 2,
    plots: transientPlots(
      ["up", "down"],
      ["350 to 1500 µmol mol⁻¹ Ca", "1500 to 350 µmol mol⁻¹ Ca"],
      [
        [-100, 300],
        [-100, 250],
      ],
      [linspace(0, 250, 6), linspace(0, 200, 5)],
      [
        {
          yLabel: FLUX,
          lines: ["A", "v_ATP", "v_NADPH"],
          y: [
            [[0, 50], linspace(10, 50, 5)],
            [[0, 50], linspace(10, 50, 5)],
          ],
        },
        {
          yLabel: RATIOS,
          // The notebook draws f(RuBP) before Ract here, unlike Figure 5.
          lines: ["gs", "f_rubp", "Ract"],
          y: [
            [[0.1, 1], linspace(0.2, 1, 5)],
            [[0, 1], linspace(0.2, 1, 5)],
          ],
        },
        {
          yLabel: CONC,
          lines: ["Pi", "RuBP", "PGA", "DHAP"],
          y: [
            [[0, 10], linspace(2, 8, 4)],
            [[0, 10], linspace(2, 8, 4)],
          ],
        },
        {
          yLabel: "Ratio",
          lines: ["ATP", "NADPH"],
          y: [
            [[0, 1], linspace(0.2, 0.8, 4)],
            [[0, 1], linspace(0.2, 0.8, 4)],
          ],
        },
      ],
    ),
    golden: transientGolden(["up", "down"], TRANSIENT_COLUMNS),
  },
  {
    id: "fig7",
    title: "Figure 7: low oxygen",
    scenarios: {
      o2: {
        parameters: { PPFD: 300, Ca: 200, p_o2: 210000 },
        pre: [halfHour],
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(250, { p_o2: 210000 }), step(700, { p_o2: 20000 })],
        },
      },
    },
    plots: [
      {
        type: "line",
        x: "o2.time",
        // The notebook drops the first 50 s.
        y: [
          {
            of: "o2.A * 1000",
            label: "Modelled A",
            color: "#00c96d",
            xRange: [50, Infinity],
          },
          {
            of: "o2.PhiPSII",
            label: "Modelled Y(II)",
            axis: "right",
            color: "#868686",
            dash: "dotted",
            lineWidth: 2,
            xRange: [50, Infinity],
          },
        ],
        xLabel: "Time / s",
        yLabel: "Net Assimilation / µmol m⁻² s⁻¹",
        yRightLabel: "Y(II)",
        xLim: [0, 700],
        xTicks: linspace(100, 600, 6),
        yLim: [5, 20],
        yTicks: linspace(6, 18, 5),
        yRightLim: [0, 0.8],
        yRightTicks: linspace(0.1, 0.7, 4),
        legend: true,
        phases: [
          {
            from: 0,
            to: 250,
            y: [19, 20],
            color: "#fd8040",
            text: "Ambient O₂",
            textColor: "white",
          },
          {
            from: 250,
            to: 700,
            y: [19, 20],
            color: "#0000fe",
            text: "2% O₂",
            textColor: "white",
          },
        ],
      },
    ],
    golden: {
      A: { x: "o2.time", y: "o2.A" },
      PhiPSII: { x: "o2.time", y: "o2.PhiPSII" },
    },
  },
];
