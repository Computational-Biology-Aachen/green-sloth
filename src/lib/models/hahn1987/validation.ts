import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  Scenario,
  Validation,
} from "#lib/validation/types.js";

const POINTS = 10001;
const course = (tEnd: number) =>
  ({ kind: "timeCourse", tEval: linspace(0, tEnd, POINTS) }) as const;

const figure = (
  id: string,
  title: string,
  scenarios: Record<string, Scenario>,
  labels: Record<string, string>,
  columns: string[],
): Validation => {
  const golden: Record<string, GoldenSeries> = {};
  for (const [scenario, label] of Object.entries(labels)) {
    for (const col of columns) {
      golden[`${col}_${label}`] = {
        x: `${scenario}.time`,
        y: `${scenario}.${col}`,
      };
    }
  }
  return {
    id,
    title,
    scenarios,
    deriveEach: { minutes: "time / 60" },
    plots: Object.keys(labels).map((scenario) => ({
      type: "line",
      title: labels[scenario],
      x: `${scenario}.minutes`,
      y: columns.map((c) => ({ of: `${scenario}.${c}`, label: c })),
      xLabel: "Time (min)",
      yLabel: "Concentration (mM)",
    })),
    golden,
  };
};

const zeroPools: Scenario["initial"] = {
  RuBP: 0,
  TP: 0,
  HP: 0,
  TPGA: 0,
  E4P: 0,
  S7P: 0,
  Ru5P: 0,
  GA: 0,
  PGl: 0,
  Gl: 0,
  Gn: 0,
  Gx: 0,
};

export const validations: Validation[] = [
  figure(
    "fig2",
    "Figure 2: approach to steady state",
    {
      short: { initial: zeroPools, simulate: course(240) },
      long: { initial: zeroPools, simulate: course(4800) },
    },
    { short: "240", long: "4800" },
    ["TP", "RuBP", "PGA", "Gl"],
  ),
  figure(
    "fig3",
    "Figure 3: effect of CO₂",
    {
      low: { parameters: { Ca: 0.05 }, simulate: course(120) },
      high: { parameters: { Ca: 4.5 }, simulate: course(120) },
    },
    { low: "0.05", high: "4.5" },
    ["RuBP", "PGA", "Gl", "PAn"],
  ),
  figure(
    "fig4",
    "Figure 4: effect of O₂",
    {
      low: { parameters: { Oa: 10 }, simulate: course(120) },
      high: { parameters: { Oa: 200 }, simulate: course(120) },
    },
    { low: "10", high: "200" },
    ["RuBP", "PGA", "Gl", "PAn"],
  ),
];
