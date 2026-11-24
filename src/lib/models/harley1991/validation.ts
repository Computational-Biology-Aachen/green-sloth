import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 1–5, all of the paper's figures. Figs 1 and 2 are the model fits to
 * A–Ci curves of cotton and soybean, with the printed best-fit parameters; the
 * measured points behind them are not tabulated. Figs 3–5 are simulations
 * with the soybean parameters of Fig 2C, but drawn with R = 56.7 instead of
 * Fig 2C's 49.6 (see curatornotes.md).
 */
const steadyState = { kind: "steadyState" } as const;
type Over = Record<string, number>;

function scan(Ci: number[], set: Over): Scan {
  return {
    over: {
      Ci,
      ...Object.fromEntries(Object.entries(set).map(([k, v]) => [k, [v]])),
    },
    x: Ci,
    columns: ["A"],
    simulate: steadyState,
  };
}

// Evaluated without a solver, so the TS engine and the exported notebook agree
// to rounding: a tight tolerance catches any drift between the two.
function golden(names: string[]): Record<string, GoldenSeries> {
  return Object.fromEntries(
    names.map((k): [string, GoldenSeries] => [
      `A_${k}`,
      { x: `${k}.x`, y: `${k}.A`, tolerance: 1e-9 },
    ]),
  );
}

const A_LABEL = "Net photosynthesis / µmol m⁻² s⁻¹";
const CI_LABEL = "Intercellular CO₂ / µbar";

function curve(scan: string, style: Partial<LineSeries> = {}): LineSeries {
  return { of: `${scan}.A`, x: `${scan}.x`, color: "black", ...style };
}

// ---- Figs 1 and 2: fits at 20 mbar O₂ (open symbols) and ambient (closed)

/** One panel's best-fit parameters and the glycerate fraction it assumes. */
interface Fit {
  panel: string;
  f_gly: number;
  set: Over;
  label: string;
}

function fitFigure(
  id: string,
  title: string,
  species: { T_leaf: number; Rd?: number },
  O: [number, number],
  xMax: number,
  fits: Fit[],
): Validation {
  const Ci = linspace(20, xMax, (xMax - 20) / 2 + 1);
  const scans: Record<string, Scan> = {};
  const plots: LinePlot[] = fits.map(({ panel, f_gly, set, label }) => {
    const p = panel.toLowerCase();
    for (const o of O) {
      scans[`${p}_o${o}`] = scan(Ci, {
        ...species,
        ...set,
        f_gly,
        PPFD: 1500,
        O: o,
      });
    }
    return {
      type: "line",
      panel,
      title: label,
      x: `${p}_o${O[0]}.x`,
      // The paper tells the two O₂ levels apart by their data symbols
      y: O.map((o, i) =>
        curve(`${p}_o${o}`, {
          label: `${o} mbar O₂`,
          dash: i === 0 ? "solid" : "dashed",
        }),
      ),
      xLabel: CI_LABEL,
      yLabel: A_LABEL,
      xLim: [0, xMax],
      yLim: [0, 40],
      legend: true,
      legendPosition: "bottom",
    };
  });
  return {
    id,
    title,
    columns: 1,
    scans,
    plots,
    golden: golden(Object.keys(scans)),
  };
}

// ---- Figs 3–5: soybean simulations with markers every 50 µbar

/** Fig 2C's soybean fit, with R as Figs 3–5 are drawn. */
const SOY_SIM: Over = {
  T_leaf: 25,
  Rd: 0,
  Vcmax: 120.9,
  R: 56.7,
  T: 9.62,
  f_gly: 0.5,
  PPFD: 1500,
  O: 210,
};

type Marker = Pick<LineSeries, "marker" | "markerFace">;
const OPEN_CIRCLE: Marker = { marker: "o", markerFace: "white" };
const CLOSED_CIRCLE: Marker = { marker: "o", markerFace: "black" };
const OPEN_TRIANGLE: Marker = { marker: "^", markerFace: "white" };
const CLOSED_TRIANGLE: Marker = { marker: "^", markerFace: "black" };
const OPEN_SQUARE: Marker = { marker: "s", markerFace: "white" };
const CLOSED_SQUARE: Marker = { marker: "s", markerFace: "black" };

/** One simulated family: a curve per value of `param`, marked every 50 µbar. */
function simFigure(
  id: string,
  title: string,
  param: string,
  curves: Array<[value: number, label: string, marker: Marker]>,
  xMax: number,
  xLim: number,
): Validation {
  // 10 µbar steps from 50, so every fifth point falls on a 50 µbar marker
  const Ci = linspace(50, xMax, (xMax - 50) / 10 + 1);
  const scans = Object.fromEntries(
    curves.map(([v]) => [`${param}${v}`, scan(Ci, { ...SOY_SIM, [param]: v })]),
  );
  return {
    id,
    title,
    scans,
    plots: [
      {
        type: "line",
        title: "Soybean simulation (25 °C)",
        x: `${param}${curves[0][0]}.x`,
        y: curves.map(([v, label, marker]) =>
          curve(`${param}${v}`, {
            ...marker,
            markEvery: 5,
            markerEdge: "black",
            markerSize: 5,
            label,
          }),
        ),
        xLabel: CI_LABEL,
        yLabel: A_LABEL,
        xLim: [0, xLim],
        yLim: [0, 40],
        legend: true,
      },
    ],
    golden: golden(Object.keys(scans)),
  };
}

const COTTON_VCMAX = 127.3;
const SOY_VCMAX = 120.9;

export const validations: Validation[] = [
  fitFigure(
    "fig1",
    "Figure 1: fits to cotton A–Ci curves (29 °C)",
    { T_leaf: 29, Rd: 2.12 },
    [20, 200],
    800,
    [
      {
        panel: "A",
        f_gly: 0.75,
        set: { Vcmax: COTTON_VCMAX, R: 57.65, T: 12.6 },
        label: "Wp = 3T + 0.5Vo",
      },
      {
        panel: "B",
        f_gly: 0,
        set: { Vcmax: COTTON_VCMAX, R: 56.7, T: 12.04 },
        label: "Wp = 3T + 2Vo",
      },
      {
        panel: "C",
        f_gly: 0.5,
        set: { Vcmax: COTTON_VCMAX, R: 56.7, T: 12.39 },
        label: "Wp = 3T + Vo",
      },
    ],
  ),
  fitFigure(
    "fig2",
    "Figure 2: fits to soybean A–Ci curves (25 °C)",
    { T_leaf: 25, Rd: 0 },
    [20, 180],
    900,
    [
      {
        panel: "A",
        f_gly: 0.75,
        set: { Vcmax: SOY_VCMAX, R: 49.6, T: 10.01 },
        label: "Wp = 3T + 0.5Vo",
      },
      {
        panel: "B",
        f_gly: 0,
        set: { Vcmax: SOY_VCMAX, R: 49.0, T: 9.06 },
        label: "Wp = 3T + 2Vo",
      },
      {
        panel: "C",
        f_gly: 0.5,
        set: { Vcmax: SOY_VCMAX, R: 49.6, T: 9.62 },
        label: "Wp = 3T + Vo",
      },
    ],
  ),
  simFigure(
    "fig3",
    "Figure 3: A–Ci curves at four irradiances (210 mbar O₂)",
    "PPFD",
    [
      [1500, "PFD=1500", OPEN_CIRCLE],
      [1200, "PFD=1200", CLOSED_CIRCLE],
      [900, "PFD=900", OPEN_TRIANGLE],
      [600, "PFD=600", CLOSED_TRIANGLE],
    ],
    780,
    800,
  ),
  simFigure(
    "fig4",
    "Figure 4: A–Ci curves at 20, 200 and 400 mbar O₂",
    "O",
    [
      [20, "20 mbar Oxygen", OPEN_CIRCLE],
      [200, "200 mbar", CLOSED_CIRCLE],
      [400, "400 mbar", OPEN_SQUARE],
    ],
    780,
    800,
  ),
  simFigure(
    "fig5",
    "Figure 5: decreasing triose phosphate utilisation (210 mbar O₂)",
    "T",
    [
      [12, "T=12", CLOSED_CIRCLE],
      [9, "T=9", OPEN_TRIANGLE],
      [6, "T=6", CLOSED_SQUARE],
      [3, "T=3", OPEN_CIRCLE],
    ],
    550,
    600,
  ),
];
