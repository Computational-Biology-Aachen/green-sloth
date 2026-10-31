import { step, sweep } from "#lib/validation/helpers.js";
import type { GoldenSeries, Validation } from "#lib/validation/types.js";

const intensities = [20, 50, 100, 150, 200];
const id = (i: number) => `pfd${i}`;

const golden: Record<string, GoldenSeries> = {};
for (const i of intensities) {
  for (const col of ["Orthophosphate", "rubisco_carboxylase"]) {
    golden[`${col}${i}`] = { x: `${id(i)}.time`, y: `${id(i)}.${col}` };
  }
}

const lines = (of: (scenario: string) => string) =>
  intensities.map((i) => ({ of: of(id(i)), label: `${i} PFD` }));

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: light-dark-light transitions",
    atol: 1e-14,
    scenarios: Object.fromEntries(
      Object.values(
        sweep("", intensities, (i) => ({
          simulate: {
            kind: "protocol",
            // MxlPy's simulate() without `steps` gives 99 intervals.
            steps: [
              step(300, { PPFD: i }, 99),
              step(200, { PPFD: 5 }, 200),
              step(300, { PPFD: i }, 300),
            ],
          },
        })),
      ).map((s, k) => [id(intensities[k]), s]),
    ),
    plots: [
      {
        type: "line",
        title: "Internal free orthophosphate",
        x: "pfd20.time",
        y: lines((s) => `${s}.Orthophosphate / 15`),
        xLabel: "Time (s)",
        yLabel: "Int. free [PO4³⁻] (mM)",
        xLim: [200, 850],
        phases: [{ from: 300, to: 500 }],
      },
      {
        type: "line",
        title: "TPT export",
        x: "pfd20.time",
        y: lines((s) => `${s}.ex_pga + ${s}.ex_gap + ${s}.ex_dhap`),
        xLabel: "Time (s)",
        yLabel: "TPT translocators (mM/s)",
        xLim: [200, 850],
        phases: [{ from: 300, to: 500 }],
      },
      {
        type: "line",
        title: "Carbon fixation",
        x: "pfd20.time",
        y: lines((s) => `${s}.rubisco_carboxylase`),
        xLabel: "Time (s)",
        yLabel: "RuBisCO (mM/s)",
        xLim: [200, 850],
        phases: [{ from: 300, to: 500 }],
      },
    ],
    golden,
  },
];
