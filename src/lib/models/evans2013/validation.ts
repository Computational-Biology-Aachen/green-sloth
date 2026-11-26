import { linspace } from "#lib/validation/helpers.js";
import type { GoldenSeries, Validation } from "#lib/validation/types.js";

/**
 * Fig 7 is the paper's only model output: Eqns 13–17 with the constants of the
 * Results. Fig 5's regression line is the fitted linear gm(T); its measured
 * points are not tabulated. Figs 1–4 and 6 are measurements (see
 * curatornotes.md).
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

const G_UNIT = "mol m⁻² s⁻¹ bar⁻¹";

export const validations: Validation[] = [
  {
    id: "fig5",
    title:
      "Figure 5: linear temperature response of gm, normalised to 25 °C (2 % O₂ regression)",
    // gm25_lin = 1: the normalised regression as drawn, from 12 to 42 °C
    scans: {
      t: {
        over: { T_leaf: linspace(12, 42, 301), gm25_lin: [1] },
        columns: ["gm_lin"],
        simulate: steadyState,
      },
    },
    plots: [
      {
        type: "line",
        x: "t.x",
        y: [{ of: "t.gm_lin", color: "black", lineWidth: 1 }],
        xLabel: "Leaf temperature / °C",
        yLabel: "Normalized mesophyll conductance",
        xLim: [5, 45],
        yLim: [0, 2.5],
        xTicks: [10, 20, 30, 40],
        yTicks: [0, 0.5, 1, 1.5, 2, 2.5],
        legend: false,
      },
    ],
    golden: golden("t", ["gm_lin"]),
  },
  {
    id: "fig7",
    title:
      "Figure 7: modelled conductances through the liquid phase and membranes, and gm",
    columns: 1,
    scans: {
      t: {
        over: { T_leaf: linspace(10, 45, 351) },
        columns: ["g_liq", "g_mem", "gm"],
        simulate: steadyState,
      },
    },
    plots: [
      {
        type: "line",
        panel: "a",
        x: "t.x",
        y: [
          { of: "t.g_liq", label: "gliq", color: "black" },
          { of: "t.g_mem", label: "gmem", color: "black", dash: "dashed" },
        ],
        yLabel: `gliq and gmem / ${G_UNIT}`,
        xLim: [10, 45],
        yLim: [0, 3],
        xTicks: [10, 20, 30, 40],
        yTicks: [0, 1, 2, 3],
        legend: true,
      },
      {
        type: "line",
        panel: "b",
        x: "t.x",
        y: [{ of: "t.gm", color: "black" }],
        xLabel: "Temperature / °C",
        yLabel: `gm / ${G_UNIT}`,
        xLim: [10, 45],
        yLim: [0, 1],
        xTicks: [10, 20, 30, 40],
        yTicks: [0, 0.4, 0.8],
        legend: false,
      },
    ],
    golden: golden("t", ["g_liq", "g_mem", "gm"]),
  },
];
