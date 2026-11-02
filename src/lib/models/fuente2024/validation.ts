import { defaultGrid, linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  Scenario,
  Validation,
} from "#lib/validation/types.js";

const course = (tEnd: number) =>
  ({ kind: "timeCourse", tEval: defaultGrid(tEnd) }) as const;

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
      simulate: course(ENDS[k]),
    };
    for (const c of fig4Columns) {
      fig4Golden[`${c}_${id}`] = { x: `${id}.time`, y: `${id}.${c}` };
    }
  });
}

const ATP_TOTAL = "param.AP_tot";

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: slow light oscillation",
    simulate: course(40000),
    scenarios: {
      osc: { parameters: { f: 1 / 10000, PPFD: 500, PPFD_add: 450 } },
    },
    deriveEach: { pH: "-log10(H_lumen * 1e-6)" },
    plots: [
      ["osc_light", "Light intensity (µmol photons m⁻² s⁻¹)", [0, 1100]],
      ["PQ", "Oxidized PQ (PQ · PSII⁻¹)", [1, 5]],
      ["pH", "Lumen pH", [5.6, 6.6]],
      ["Q_active", "Active quencher (rel. units)", [0, 1]],
      [`ATP_st / ${ATP_TOTAL}`, "ATP / stroma ratio", [0, 1]],
      ["PSI_ox", "PI ox (rel. units)", [0, 0.8]],
    ].map(([of, yLabel, yLim]) => ({
      type: "line" as const,
      x: "osc.time",
      y: [{ of: (of as string).replace(/^(\w+)/, "osc.$1") }],
      xLabel: "Time (s)",
      yLabel: yLabel as string,
      xLim: [2e4, 4e4] as [number, number],
      yLim: yLim as [number, number],
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
    simulate: { kind: "steadyState" },
    scans: {
      scan: { over: { PPFD: pfd, PPFD_add: [0] }, columns: fig3Columns },
    },
    plots: [
      {
        type: "line",
        x: "scan.x",
        y: [
          { of: "scan.Q_active", label: "Active quencher" },
          {
            of: "-log10(scan.H_lumen * 1e-6)",
            label: "Lumen pH",
            axis: "right",
          },
          { of: "scan.PSI_ox / param.PSI_total", label: "PI ox" },
          { of: "scan.PQ / param.PQ_tot", label: "Oxidized PQ" },
        ],
        xLabel: "Light intensity (µmol photons m⁻² s⁻¹)",
        yLabel: "Concentration ratios",
        yRightLabel: "Lumen pH",
      },
      {
        type: "line",
        x: "scan.x",
        y: [
          { of: "scan.NPQ", label: "NPQ" },
          { of: "scan.Fluo", label: "ChlF" },
          { of: "scan.O2", label: "O₂ evolution", axis: "right" },
        ],
        xLabel: "Light intensity (µmol photons m⁻² s⁻¹)",
        yLabel: "NPQ, ChlF (rel. units)",
        yRightLabel: "O₂ rate",
      },
    ],
    golden: Object.fromEntries(
      fig3Columns.map((c) => [c, { x: "scan.x", y: `scan.${c}` }]),
    ),
  },
  {
    id: "fig4",
    title: "Figures 4 and 5: light oscillation periods",
    scenarios: fig4Scenarios,
    plots: PERIODS.map((T, k) => ({
      type: "line" as const,
      title: `T = ${T} s`,
      x: `h950_t${k}.time`,
      y: [
        { of: `h950_t${k}.NPQ`, label: "50-950" },
        { of: `h150_t${k}.NPQ`, label: "50-150" },
      ],
      xLabel: "Time (s)",
      yLabel: "NPQ",
      yLim: [0, 1.5] as [number, number],
    })),
    golden: fig4Golden,
  },
];
