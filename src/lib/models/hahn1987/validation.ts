import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  Plot,
  Scenario,
  Validation,
} from "#lib/validation/types.js";

const POINTS = 10001;
const course = (tEnd: number) =>
  ({ kind: "timeCourse", tEval: linspace(0, tEnd, POINTS) }) as const;

interface Panel {
  scenario: string;
  /** Each plotted pool and its scale factor, as in the paper's figure. */
  factors: Record<string, number>;
  xLim: [number, number];
  xTicks: number[];
  yLim: [number, number];
  yLabel?: string;
}

/**
 * One figure: two panels of black, directly labelled time courses, the pools
 * scaled to share one axis, lettered A and B.
 */
const figure = (
  id: string,
  title: string,
  scenarios: Record<string, Scenario>,
  labels: Record<string, string>,
  columns: string[],
  panels: Panel[],
  letterAt: "left" | "right",
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
    columns: 1,
    scenarios,
    deriveEach: { minutes: "time / 60" },
    plots: panels.map((p, i): Plot => ({
      type: "line",
      x: `${p.scenario}.minutes`,
      y: Object.entries(p.factors).map(([c, f]) => ({
        of: f === 1 ? `${p.scenario}.${c}` : `${p.scenario}.${c} * ${f}`,
        color: "black",
        endLabel: c,
      })),
      xLabel: "Time (min)",
      ...(p.yLabel ? { yLabel: p.yLabel } : {}),
      xLim: p.xLim,
      xTicks: p.xTicks,
      yLim: p.yLim,
      yTicks: linspace(0, 1, 11),
      legend: false,
      annotations: [
        {
          text: "AB"[i],
          x: letterAt === "left" ? 0.02 : 0.98,
          y: 0.96,
          coords: "axes",
          align: letterAt,
        },
      ],
    })),
    golden,
  };
};

const MM = "Concentration (mM)";
const twoMinutes: Pick<Panel, "xLim" | "xTicks" | "yLim" | "yLabel"> = {
  xLim: [0, 2.35],
  xTicks: linspace(0, 2, 9),
  yLim: [0, 1.05],
  yLabel: MM,
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
    ["short", "long"].map((scenario, i) => ({
      scenario,
      factors: {
        TP: 1,
        Gl: 1,
        RuBP: 1,
        HP: 0.67,
        PGA: 0.5,
        PGl: 0.2,
        NH3: 0.4,
      },
      xLim: i === 0 ? [0, 4.6] : [0, 90],
      xTicks: i === 0 ? linspace(0, 4, 9) : linspace(0, 80, 9),
      yLim: [0, 1],
      ...(i === 0 ? { yLabel: MM } : {}),
    })),
    "left",
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
    [
      {
        scenario: "low",
        factors: {
          RuBP: 0.25,
          PGA: 0.5,
          TP: 0.5,
          PGl: 0.5,
          Gl: 0.57,
          Gn: 0.5,
          NH3: 0.67,
          PAn: 0.02,
        },
      },
      {
        scenario: "high",
        factors: {
          RuBP: 1,
          PGA: 0.25,
          TP: 0.33,
          PGl: 1,
          Gl: 1,
          Gn: 0.8,
          NH3: 0.8,
          PAn: 0.005,
        },
      },
    ].map((p): Panel => ({ ...p, ...twoMinutes })),
    "right",
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
    [
      {
        scenario: "low",
        factors: {
          RuBP: 0.5,
          PGA: 0.5,
          TP: 0.8,
          PGl: 0.5,
          Gl: 0.67,
          Gn: 0.5,
          NH3: 0.67,
          PAn: 0.02,
        },
      },
      {
        scenario: "high",
        factors: {
          RuBP: 0.5,
          PGA: 0.25,
          TP: 0.67,
          PGl: 0.67,
          Gl: 0.33,
          Gn: 0.5,
          NH3: 0.67,
          PAn: 0.02,
        },
      },
    ].map((p): Panel => ({ ...p, ...twoMinutes })),
    "left",
  ),
];
