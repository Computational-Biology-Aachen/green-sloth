import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 1 and 3. Fig 2 compares other published sets of temperature functions
 * against data for sugar maple and is not reproduced.
 */
const steadyState = { kind: "steadyState" } as const;

// Evaluated without a solver, so this model and the notebook's reference
// implementation (the goldens) agree to rounding: a tight tolerance catches any
// drift between the two.
function golden(scan: string, cols: string[]): Record<string, GoldenSeries> {
  return Object.fromEntries(
    cols.map((c): [string, GoldenSeries] => [
      c,
      { x: `${scan}.x`, y: `${scan}.${c}`, tolerance: 1e-9 },
    ]),
  );
}

function panel(
  letter: string,
  cols: string[],
  yLabel: string,
  yLim: [number, number],
): LinePlot {
  return {
    type: "line",
    panel: letter,
    x: "res.x",
    y: cols.map((c) => ({ of: `res.${c}`, color: "black" })),
    xLabel: "Temperature / °C",
    yLabel,
    xLim: [5, 45],
    yLim,
    legend: false,
  };
}

const FIG1 = ["Gamma_star", "Rd", "Vcmax", "Vomax", "Vomax_Vcmax", "Kc", "Ko"];

// Fig 3: the measured means, digitized
const LEMON_T = [10, 15, 20, 25, 30, 35, 40];
const LEMON_MEASURED = [2.31, 2.68, 2.57, 2.23, 1.05, -0.37, -1.86];

export const validations: Validation[] = [
  {
    id: "fig1",
    title: "Figure 1: temperature responses of the six parameters",
    columns: 2,
    // Vc,max, Vo,max and Rd relative to their value at 25 °C
    scans: {
      res: {
        over: { T_leaf: linspace(10, 40, 301), Vcmax25: [1], Rd25: [1] },
        columns: FIG1,
        simulate: steadyState,
      },
    },
    plots: [
      panel("a", ["Gamma_star"], "Γ* / µmol mol⁻¹", [0, 100]),
      panel("b", ["Rd"], "Rd / µmol m⁻² s⁻¹", [0.5, 2.5]),
      panel("c", ["Vcmax", "Vomax"], "Vmax / µmol m⁻² s⁻¹", [0, 5]),
      panel("d", ["Vomax_Vcmax"], "Vo,max / Vc,max", [0, 0.4]),
      panel("e", ["Kc"], "Kc / µmol mol⁻¹", [0, 2000]),
      panel("f", ["Ko"], "Ko / mmol mol⁻¹", [0, 2000]),
    ],
    golden: golden("res", FIG1),
  },
  {
    id: "fig3",
    title: "Figure 3: Rubisco-limited assimilation of lemon",
    // Ci 100 µmol mol⁻¹ and the lemon Vc,max and Rd at 25 °C, the model defaults
    scans: {
      res: {
        over: { T_leaf: LEMON_T },
        columns: ["A"],
        simulate: steadyState,
      },
    },
    data: { T: LEMON_T, measured: LEMON_MEASURED },
    plots: [
      {
        type: "line",
        x: "res.x",
        y: [
          {
            of: "res.A",
            label: "Modelled values",
            color: "black",
            marker: "o",
          },
          {
            of: "data.measured",
            x: "data.T",
            label: "Measured values",
            color: "black",
            style: "markers",
            marker: "s",
            markerFace: "none",
          },
        ],
        xLabel: "Temperature / °C",
        yLabel: "A / µmol m⁻² s⁻¹",
        xLim: [5, 45],
        yLim: [-3, 3],
        legend: true,
      },
    ],
    golden: golden("res", ["A"]),
  },
];
