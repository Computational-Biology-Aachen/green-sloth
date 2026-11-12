import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 2–4: the limiting rates and net assimilation against Ci, leaf
 * temperature and PPFD. Unscanned conditions are those of the paper's Fig 2
 * (PPFD 1500 µmol m⁻² s⁻¹, 25 °C), the model defaults. Figs 3 and 4 hold Ci at
 * 247.4 µmol mol⁻¹, not the captions' 270: their Rubisco-limited rate at 25 °C
 * (19.8) lies below Fig 2's at 270 (21.6), and they reproduce at 247.4.
 */
const COLUMNS = ["rubisco", "rubp", "tpu", "an"];
const steadyState = { kind: "steadyState" } as const;
const CI_FIG34 = 247.4;

function scan(over: Record<string, number[]>): Record<string, Scan> {
  return { res: { over, columns: COLUMNS, simulate: steadyState } };
}

function series(): LineSeries[] {
  return [
    {
      of: "res.rubisco",
      label: "Rubisco",
      color: "royalblue",
      dash: "dashed",
    },
    {
      of: "res.rubp",
      label: "RuBP",
      color: "mediumvioletred",
      dash: "dashed",
    },
    { of: "res.tpu", label: "TPU", color: "darkkhaki", dash: "dashed" },
    { of: "res.an", label: "A", color: "black", lineWidth: 2.5 },
  ];
}

// Evaluated without a solver, so this model and mxl-models' (the goldens) agree
// to rounding: a tight tolerance catches any drift between the two.
function golden(): Record<string, GoldenSeries> {
  return Object.fromEntries(
    COLUMNS.map((c): [string, GoldenSeries] => [
      c,
      { x: "res.x", y: `res.${c}`, tolerance: 1e-9 },
    ]),
  );
}

const yLabel = "A / µmol m⁻² s⁻¹";

function plot(p: Omit<LinePlot, "type" | "x" | "y" | "yLabel">): LinePlot {
  return {
    type: "line",
    x: "res.x",
    y: series(),
    yLabel,
    legend: true,
    ...p,
  };
}

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: photosynthetic CO₂ response",
    scans: scan({ Ci: linspace(1, 1000, 700) }),
    plots: [
      plot({
        title: "Photosynthetic-CO₂ response curve",
        xLabel: "Cᵢ / µmol mol⁻¹",
        xLim: [0, 1000],
        yLim: [-10, 55],
        xTicks: linspace(0, 1000, 6),
        yTicks: linspace(-10, 50, 7),
        hLines: [{ value: 0, color: "#bfbfbf", lineWidth: 1 }],
      }),
    ],
    golden: golden(),
  },
  {
    id: "fig3",
    title: "Figure 3: photosynthetic leaf-temperature response",
    scans: scan({ T_leaf: linspace(5, 40, 351), Ci: [CI_FIG34] }),
    plots: [
      plot({
        title: "Photosynthetic-T_leaf response curve",
        xLabel: "T_leaf / °C",
        xLim: [5, 40],
        yLim: [0, 35],
        xTicks: linspace(5, 40, 8),
        yTicks: linspace(0, 35, 8),
      }),
    ],
    golden: golden(),
  },
  {
    id: "fig4",
    title: "Figure 4: photosynthetic PPFD response",
    scans: scan({ PPFD: linspace(0, 2000, 700), Ci: [CI_FIG34] }),
    plots: [
      plot({
        title: "Photosynthetic-PPFD response curve",
        xLabel: "PPFD / µmol m⁻² s⁻¹",
        xLim: [0, 2000],
        yLim: [0, 35],
        xTicks: linspace(0, 2000, 5),
        yTicks: linspace(0, 35, 8),
      }),
    ],
    golden: golden(),
  },
];
