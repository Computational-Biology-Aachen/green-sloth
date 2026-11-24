import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  LineSeries,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 1 and 2: the functions of Table I (and, in Fig 2b,c, Bernacchi et al.
 * 2001's apparent Kc and Ko). The measured points behind Figs 1 and 2a are not
 * tabulated. Fig 3 is derived from measured A/Ci curves and is not reproduced
 * (see curatornotes.md).
 */
const steadyState = { kind: "steadyState" } as const;

// Evaluated without a solver, so the TS engine and the exported notebook agree
// to rounding: a tight tolerance catches any drift between the two.
function golden(scan: string, cols: string[]): Record<string, GoldenSeries> {
  return Object.fromEntries(
    cols.map((c): [string, GoldenSeries] => [
      `${scan}_${c}`,
      { x: `${scan}.x`, y: `${scan}.${c}`, tolerance: 1e-9 },
    ]),
  );
}

const T_LABEL = "Temperature / °C";

function panel(
  letter: string,
  y: LineSeries[],
  yLabel: string,
  yLim: [number, number],
  xLabel?: string,
): LinePlot {
  return {
    type: "line",
    panel: letter,
    x: "t.x",
    y,
    xLabel,
    yLabel,
    xLim: [5, 45],
    yLim,
    legend: false,
  };
}

// Fig 2b,c: von Caemmerer et al. (1994)'s Kc and Ko at 25 °C, read off the figure
const VC1994 = { T: [25], Kc: [260], Ko: [178] };

const point = (col: string): LineSeries => ({
  of: `data.${col}`,
  x: "data.T",
  color: "black",
  style: "markers",
  marker: "o",
});

export const validations: Validation[] = [
  {
    id: "fig1",
    title: "Figure 1: temperature response of gm, normalised to 25 °C",
    // gm25 = 1: Eqn 6 as drawn, which is 0.990 at 25 °C
    scans: {
      t: {
        over: { T_leaf: linspace(10, 40, 301), gm25: [1] },
        columns: ["gm"],
        simulate: steadyState,
      },
    },
    plots: [
      {
        type: "line",
        x: "t.x",
        y: [{ of: "t.gm", color: "black" }],
        xLabel: T_LABEL,
        yLabel: "gm normalised to unity at 25 °C",
        xLim: [5, 45],
        yLim: [0, 2.5],
        legend: false,
      },
    ],
    golden: golden("t", ["gm"]),
  },
  {
    id: "fig2",
    title:
      "Figure 2: Γ*, Kc and Ko on a Cc basis (dashed) and apparent (solid)",
    columns: 1,
    // Panel a is drawn over 5–45 °C, the Kc and Ko curves over 10–40 °C
    scans: {
      t: {
        over: { T_leaf: linspace(5, 45, 401) },
        columns: ["Gamma_star"],
        simulate: steadyState,
      },
      k: {
        over: { T_leaf: linspace(10, 40, 301) },
        columns: ["Kc", "Kc_app", "Ko", "Ko_app"],
        simulate: steadyState,
      },
    },
    data: VC1994,
    plots: [
      // The paper's axis reads µmol m⁻² s⁻¹, a misprint for a CO₂ mole fraction
      panel(
        "a",
        [{ of: "t.Gamma_star", color: "black" }],
        "Γ* / µmol mol⁻¹",
        [0, 80],
      ),
      panel(
        "b",
        [
          { of: "k.Kc_app", x: "k.x", color: "black" },
          { of: "k.Kc", x: "k.x", color: "black", dash: "dashed" },
          point("Kc"),
        ],
        "Kc / µmol mol⁻¹",
        [0, 2000],
      ),
      panel(
        "c",
        [
          { of: "k.Ko_app", x: "k.x", color: "black" },
          { of: "k.Ko", x: "k.x", color: "black", dash: "dashed" },
          point("Ko"),
        ],
        "Ko / mmol mol⁻¹",
        [0, 600],
        T_LABEL,
      ),
    ],
    golden: {
      ...golden("t", ["Gamma_star"]),
      ...golden("k", ["Kc", "Kc_app", "Ko", "Ko_app"]),
    },
  },
];
