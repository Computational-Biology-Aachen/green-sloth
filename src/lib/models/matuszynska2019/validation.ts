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

const COLORS: Record<number, string> = {
  20: "royalblue",
  50: "forestgreen",
  100: "indianred",
  150: "darkorange",
  200: "black",
};

const lines = (of: (scenario: string) => string) =>
  intensities.map((i) => ({
    of: of(id(i)),
    label: `${i}PFD`,
    color: COLORS[i],
    dash: "dashdot" as const,
    lineWidth: 2,
  }));

/** Shared by the three stacked panels, as the notebook's `sharex`. */
const PANEL = {
  type: "line" as const,
  x: "pfd20.time",
  xLim: [200, 850] as [number, number],
  phases: [{ from: 300, to: 500, color: "dimgray", alpha: 0.4 }],
  grid: true,
};

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
    columns: 1,
    plots: [
      {
        ...PANEL,
        y: lines((s) => `${s}.Orthophosphate / 15`),
        yLabel: "Int. free [PO4³⁻] (mM)",
        annotations: [
          { text: "L", x: 245, y: 1.07, align: "left" },
          { text: "D", x: 390, y: 1.07, align: "left" },
          { text: "L", x: 590, y: 1.07, align: "left" },
        ],
        legend: false,
      },
      {
        ...PANEL,
        y: lines((s) => `${s}.ex_pga + ${s}.ex_gap + ${s}.ex_dhap`),
        yLabel: "TPT translocators (mM/s)",
        legend: true,
        legendPosition: "right",
      },
      {
        ...PANEL,
        y: lines((s) => `${s}.rubisco_carboxylase`),
        xLabel: "Time (s)",
        yLabel: "RuBisCO (mM/s)",
        legend: false,
      },
    ],
    golden,
  },
];
