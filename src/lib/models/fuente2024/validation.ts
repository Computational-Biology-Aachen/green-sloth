import { defaultGrid, linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LineSeries,
  OpSpec,
  Plot,
  PreRun,
  Scenario,
  Validation,
} from "#lib/validation/types.js";

// MxlPy's `simulate(t_end)` returns every solver step, which draws smooth
// curves; a fine grid does the same here. It keeps the default grid's times,
// where the goldens are.
const course = (tEnd: number) =>
  ({
    kind: "timeCourse",
    tEval: [
      ...new Set([...defaultGrid(tEnd), ...linspace(0, tEnd, 1001)]),
    ].sort((a, b) => a - b),
  }) as const;

const pfd = linspace(10, 1000, 100);
const fig3Columns = [
  "ATP_st",
  "Q_active",
  "H_lumen",
  "PSI_ox",
  "PQ",
  "O2",
  "NPQ",
  "Fluo",
];

/**
 * As the paper starts every oscillating-light run (Section 3.2): from the
 * steady state in the constant light u0, i.e. PPFD without its oscillation.
 */
const ACCLIMATED: PreRun = { kind: "steadyState", set: { PPFD_add: 0 } };

const PERIODS = [10000, 1000, 100, 1, 0.1, 0.001];
const ENDS = [50000, 5000, 500, 5, 0.5, 0.005];
const AMPLITUDES: Array<[number, number]> = [
  [50, 950],
  [50, 150],
];
const fig4Columns = ["PQ", "H_lumen", "NPQ"];

const fig4Scenarios: Record<string, Scenario> = {};
const fig4Golden: Record<string, GoldenSeries> = {};
for (const [lo, hi] of AMPLITUDES) {
  const mean = (lo + hi) / 2;
  PERIODS.forEach((T, k) => {
    const id = `h${hi}_t${k}`;
    fig4Scenarios[id] = {
      parameters: { PPFD: mean, PPFD_add: hi - mean, f: 1 / T },
      pre: [ACCLIMATED],
      simulate: course(ENDS[k]),
    };
    for (const c of fig4Columns) {
      fig4Golden[`${c}_${id}`] = { x: `${id}.time`, y: `${id}.${c}` };
    }
  });
}

const ATP_TOTAL = "param.AP_tot";
const LIGHT = "#fdb338";
const DARK = "#025196";

/** Rising (or steady) light in yellow, falling in blue, as the notebook draws. */
const byLight = (id: string) => ({
  colorBySign: { of: `${id}.lightRate`, positive: LIGHT, negative: DARK },
  lineWidth: 2,
});
const LIGHT_RATE: OpSpec[] = [
  { op: "diff", as: "lightRate", of: "osc_light", into: true },
];

const FIG2: Array<[string, string, [number, number], number[]]> = [
  [
    "osc_light",
    "Light Intensity (µmol photons m⁻² s⁻¹)",
    [0, 1100],
    linspace(0, 1000, 6),
  ],
  ["PQ", "Oxidized PQ (PQ · PSII⁻¹)", [1, 5], linspace(1, 5, 5)],
  ["pH", "Lumen pH", [5.6, 6.6], linspace(5.6, 6.6, 6)],
  ["Q_active", "Active quencher (rel. units)", [0, 1], linspace(0, 1, 6)],
  [`ATP_st / ${ATP_TOTAL}`, "ATP/Stroma Ratio", [0, 1], linspace(0, 1, 6)],
  ["PSI_ox", "PI_ox (rel. units)", [0, 0.8], linspace(0, 0.8, 5)],
];

const XLIMS: Array<[number, number]> = [
  [2e4, 4e4],
  [2e3, 4e3],
  [2e2, 4e2],
  [2, 4],
  [2e-1, 4e-1],
  [2e-3, 4e-3],
];

/**
 * Figures 4 and 5: one row per oscillation period, one column per quantity,
 * the 50-950 run solid and the 50-150 run dashed.
 */
function periodGrid(
  columns: Array<{ of: string; title: string; yLim: [number, number] }>,
): Plot[] {
  return PERIODS.flatMap((T, k) =>
    columns.map((c, col): Plot => ({
      type: "line",
      ...(k === 0 ? { title: c.title } : {}),
      x: `h950_t${k}.time`,
      y: [950, 150].map((hi) => {
        const id = `h${hi}_t${k}`;
        return {
          of: c.of.replaceAll("ID", id),
          x: `${id}.time`,
          ...byLight(id),
          ...(hi === 150 ? { dash: "dashed" as const } : {}),
        };
      }),
      ...(k === PERIODS.length - 1 ? { xLabel: "Time (s)" } : {}),
      ...(col === 0 ? { yLabel: `T = ${T} s` } : {}),
      xLim: XLIMS[k],
      xTicks: linspace(XLIMS[k][0], XLIMS[k][1], 5),
      yLim: c.yLim,
      yTicks: linspace(c.yLim[0], c.yLim[1], 6),
    })),
  );
}

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: slow light oscillation",
    columns: 2,
    simulate: course(40000),
    scenarios: {
      osc: {
        parameters: { f: 1 / 10000, PPFD: 500, PPFD_add: 450 },
        pre: [ACCLIMATED],
      },
    },
    deriveEach: { pH: "-log10(H_lumen * 1e-6)" },
    ops: LIGHT_RATE,
    plots: FIG2.map(([of, yLabel, yLim, yTicks], i): Plot => ({
      type: "line",
      x: "osc.time",
      y: [{ of: of.replace(/^(\w+)/, "osc.$1"), ...byLight("osc") }],
      ...(i >= 4 ? { xLabel: "Time (s)" } : {}),
      yLabel,
      xLim: [2e4, 4e4],
      xTicks: linspace(2e4, 4e4, 5),
      yLim,
      yTicks,
    })),
    golden: Object.fromEntries(
      ["osc_light", "PQ", "H_lumen", "Q_active", "ATP_st", "PSI_ox"].map(
        (c) => [c, { x: "osc.time", y: `osc.${c}` }],
      ),
    ),
  },
  {
    id: "fig3",
    title: "Figure 3: light response at steady state",
    columns: 2,
    simulate: { kind: "steadyState" },
    scans: {
      scan: { over: { PPFD: pfd, PPFD_add: [0] }, columns: fig3Columns },
    },
    plots: [
      {
        type: "line",
        x: "scan.x",
        y: [
          {
            of: `scan.ATP_st / ${ATP_TOTAL}`,
            label: "ATPₛₜ",
            color: "#8eb133",
          },
          { of: "scan.Q_active", label: "Active Quencher", color: "#e19d20" },
          {
            of: "-log10(scan.H_lumen * 1e-6)",
            label: "Lumen pH",
            axis: "right" as const,
            color: "#000000",
          },
          {
            of: "scan.PSI_ox / param.PSI_total",
            label: "PI_ox",
            color: "#f16431",
          },
          {
            of: "scan.PQ / param.PQ_tot",
            label: "Oxidized PQ",
            color: "#5f7fb6",
          },
        ].map((line): LineSeries => ({ ...line, lineWidth: 2 })),
        xLabel: "Light Intensity (µmol photons · m⁻² · s⁻¹)",
        yLabel: "Concentrations Ratios",
        yRightLabel: "Lumen pH",
        xLim: [-10, 1010],
        xTicks: linspace(0, 1000, 6),
        yLim: [0, 0.9],
        yTicks: linspace(0.2, 0.8, 4),
        yRightLim: [5, 6.8],
        yRightTicks: linspace(5.4, 6.6, 4),
        phases: [{ from: 0, to: 50, color: "#f3f2f0" }],
        legend: true,
      },
      {
        type: "line",
        x: "scan.x",
        y: [
          {
            of: "scan.O2",
            label: "O₂ evolution",
            axis: "right" as const,
            color: "#000000",
          },
          { of: "scan.NPQ", label: "NPQ", color: "#e29c23" },
          { of: "scan.Fluo", label: "ChlF", color: "#5b82b5" },
        ].map((line): LineSeries => ({ ...line, lineWidth: 2 })),
        xLabel: "Light Intensity (µmol photons · m⁻² · s⁻¹)",
        yLabel: "NPQ, ChlF (rel. units)",
        yRightLabel: "O₂ rate (mol O₂ · mol PSIIRC⁻¹ · s⁻¹)",
        xLim: [-10, 1010],
        xTicks: linspace(0, 1000, 6),
        yLim: [0, 1.25],
        yTicks: linspace(0, 1.2, 7),
        yRightLim: [0, 121],
        yRightTicks: linspace(0, 120, 7),
        phases: [{ from: 0, to: 50, color: "#f3f2f0" }],
        legend: true,
      },
    ],
    golden: Object.fromEntries(
      fig3Columns.map((c) => [c, { x: "scan.x", y: `scan.${c}` }]),
    ),
  },
  {
    id: "fig4",
    title: "Figure 4: light oscillation periods",
    columns: 5,
    scenarios: fig4Scenarios,
    deriveEach: { pH: "-log10(H_lumen * 1e-6)" },
    ops: LIGHT_RATE,
    plots: periodGrid([
      { of: "ID.PQ", title: "Oxidized PQ (PQ · PSII⁻¹)", yLim: [1, 6] },
      { of: "ID.pH", title: "Lumen pH", yLim: [5.5, 7] },
      {
        of: "ID.Q_active",
        title: "Active quencher (rel. units)",
        yLim: [0, 1],
      },
      {
        of: `ID.ATP_st / ${ATP_TOTAL}`,
        title: "ATP / Total Adenosines",
        yLim: [0, 1],
      },
      { of: "ID.PSI_ox", title: "PI_ox (rel. units)", yLim: [0, 1] },
    ]),
    golden: fig4Golden,
  },
  {
    id: "fig5",
    title: "Figure 5: fluorescence, NPQ and O₂ across periods",
    columns: 3,
    scenarios: fig4Scenarios,
    ops: LIGHT_RATE,
    plots: periodGrid([
      { of: "ID.Fluo", title: "ChlF (rel. units)", yLim: [0, 0.5] },
      { of: "ID.NPQ", title: "NPQ", yLim: [0, 1.5] },
      {
        of: "ID.O2",
        title: "O₂ rate (mol O₂ · mol PSIIRC⁻¹ · s⁻¹)",
        yLim: [0, 120],
      },
    ]),
  },
];
