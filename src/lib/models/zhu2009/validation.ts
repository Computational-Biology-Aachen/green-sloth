import { defaultGrid } from "#lib/validation/helpers.js";
import type { GoldenSeries, Validation } from "#lib/validation/types.js";

const COLUMNS = ["RuBP", "PGA", "DPGA", "Ru5P"];
const percent = [50, 100, 150, 200, 250, 300];

function scan(id: string, title: string, params: string[]): Validation {
  const golden: Record<string, GoldenSeries> = {};
  for (const p of params) {
    for (const c of COLUMNS) {
      golden[`${p}_${c}`] = { x: `${p}.index`, y: `${p}.${c}` };
    }
  }
  return {
    id,
    title,
    simulate: { kind: "steadyState" },
    scans: Object.fromEntries(
      params.map((p) => [
        p,
        {
          over: {},
          scale: { [p]: percent.map((pct) => pct / 100) },
          x: percent,
          columns: COLUMNS,
          // The notebook leaves out points that don't settle.
          allowFailure: true,
        },
      ]),
    ),
    plots: params.map((p) => ({
      type: "line",
      title: p,
      x: `${p}.x`,
      y: COLUMNS.map((c) => ({
        of: `${p}.${c}`,
        label: c,
        style: "markers" as const,
      })),
      xLabel: "Enzyme activity (% of default)",
      yLabel: "Concentration (mM)",
    })),
    golden,
  };
}

const sim = (tEnd: number) =>
  ({ kind: "timeCourse", tEval: defaultGrid(tEnd) }) as const;

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: RuBP clamped for 50 s",
    scenarios: {
      perturbed: {
        stages: [
          { simulate: sim(650) },
          {
            edits: [{ clampVariable: "RuBP", to: 0.5 }],
            simulate: sim(50),
          },
          { simulate: sim(300) },
        ],
      },
    },
    plots: ["RuBP", "PGA", "DPGA", "GAP", "Ru5P"].map((c) => ({
      type: "line",
      title: c,
      x: "perturbed.time",
      y: [{ of: `perturbed.${c}`, label: c }],
      xLabel: "Time (s)",
      yLabel: "Metabolite concentration (mM)",
      xLim: [0, 1000],
    })),
    golden: Object.fromEntries(
      ["PGA", "DPGA", "GAP", "Ru5P"].map((c) => [
        c,
        { x: "perturbed.time", y: `perturbed.${c}` },
      ]),
    ),
  },
  scan("fig3", "Figure 3: enzyme activities", [
    "V1_max",
    "V3_max",
    "V4_max",
    "V13_max",
  ]),
  scan("fig4", "Figure 4: enzyme activities", ["V2_max", "V5_max"]),
];
