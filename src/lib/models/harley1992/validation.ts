import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 1–3 and 8. Figs 4–7 compare regressions or predictions with measured
 * data and are not reproduced. O₂ is 20 kPa, the model default.
 */
const steadyState = { kind: "steadyState" } as const;

/** Table 1's parameters for plants grown in 65 Pa CO₂ (35 Pa: the defaults). */
const GROWN65 = {
  c_Vcmax: [49.46],
  dHa_Vcmax: [112.4],
  dHd_Vcmax: [201.7],
  c_Jmax: [32.88],
  dHa_Jmax: [69.1],
  dHd_Jmax: [201.1],
  dHd_TPU: [201.6],
  g0: [72.8],
  g1: [8.92],
  c_Rdark: [29.96],
  dHa_Rdark: [73.45],
};

function scan(
  over: Record<string, number[]>,
  columns: string[],
  grown65 = false,
): Scan {
  return {
    over: grown65 ? { ...over, ...GROWN65 } : over,
    columns,
    simulate: steadyState,
  };
}

// Evaluated without a solver, so this model and the notebook's reference
// implementation (the goldens) agree to rounding: a tight tolerance catches any
// drift between the two.
function golden(scans: string[], cols: string[]): Record<string, GoldenSeries> {
  return Object.fromEntries(
    scans.flatMap((s) =>
      cols.map((c): [string, GoldenSeries] => [
        `${c}_${s}`,
        { x: `${s}.x`, y: `${s}.${c}`, tolerance: 1e-9 },
      ]),
    ),
  );
}

const A_LABEL = "Net photosynthesis / µmol m⁻² s⁻¹";
const T_LABEL = "Leaf temperature / °C";

// Fig 1: the fitted capacities given in the figure, at 29 °C and PPFD 1500;
// dashed lines have no phosphate limitation
type Fit = { Vcmax: number; Rd: number; Jmax: number; TPU: number };
const FIG1: Record<string, Fit> = {
  a_solid: { Vcmax: 127.3, Rd: 2.12, Jmax: 231.4, TPU: 12.6 },
  a_dashed: { Vcmax: 127.3, Rd: 2.12, Jmax: 192.2, TPU: 1e6 },
  b_solid: { Vcmax: 138.7, Rd: 1.07, Jmax: 228.6, TPU: 11.51 },
  b_dashed: { Vcmax: 138.7, Rd: 1.07, Jmax: 177.8, TPU: 1e6 },
};
const FIG1_SCANS = Object.keys(FIG1).flatMap((k) => [`${k}_o20`, `${k}_o2`]);

function fig1Scans(): Record<string, Scan> {
  return Object.fromEntries(
    Object.entries(FIG1).flatMap(([k, { Vcmax, Rd, Jmax, TPU }]) =>
      [20, 2].map((O): [string, Scan] => [
        `${k}_o${O}`,
        {
          ...scan(
            {
              Ci: linspace(1, k.startsWith("a") ? 70 : 80, 400),
              O: [O],
              T_leaf: [29],
              PPFD: [1500],
              Rd: [Rd],
            },
            ["A"],
          ),
          edits: [
            { setAssignment: "Vcmax", to: String(Vcmax) },
            { setAssignment: "Jmax", to: String(Jmax) },
            { setAssignment: "TPU", to: String(TPU) },
          ],
        },
      ]),
    ),
  );
}

function fig1Panel(panel: "a" | "b", title: string): LinePlot {
  return {
    type: "line",
    panel,
    title,
    x: `${panel}_solid_o20.x`,
    y: FIG1_SCANS.filter((s) => s.startsWith(panel)).map((s): LineSeries => ({
      of: `${s}.A`,
      x: `${s}.x`,
      color: "black",
      dash: s.includes("dashed") ? "dashed" : "solid",
    })),
    xLabel: "Intercellular CO₂ / Pa",
    yLabel: A_LABEL,
    xLim: [0, panel === "a" ? 70 : 80],
    yLim: [0, 40],
    legend: false,
  };
}

function grownPair(
  col: string,
  yLabel: string,
  yLim: [number, number],
  xLim: [number, number],
): LinePlot {
  return {
    type: "line",
    x: "g35.x",
    y: [
      { of: `g35.${col}`, label: "35 Pa CO₂", color: "black" },
      {
        of: `g65.${col}`,
        x: "g65.x",
        label: "65 Pa CO₂",
        color: "black",
        dash: "dashed",
      },
    ],
    xLabel: T_LABEL,
    yLabel,
    xLim,
    yLim,
    legend: true,
  };
}

// Fig 8: the operating points the paper prints, with supply lines down to Ca
const OPERATING = {
  op35: { Ci: [25.9, 49.5], A: [21.1, 27.4], Ca: [35, 65] },
  op65: { Ci: [48.4], A: [26.3], Ca: [65] },
};

function fig8Panel(
  panel: "a" | "b",
  key: "35" | "65",
  title: string,
): LinePlot {
  const op = OPERATING[`op${key}`];
  return {
    type: "line",
    panel,
    title,
    x: `d${key}.x`,
    y: [
      { of: `d${key}.A`, color: "black", lineWidth: 2.5 },
      ...op.Ci.map((_, i): LineSeries => ({
        of: `data.supply${key}_${i}_A`,
        x: `data.supply${key}_${i}_C`,
        color: "black",
        lineWidth: 1,
      })),
      {
        of: `data.op${key}_A`,
        x: `data.op${key}_Ci`,
        style: "markers",
        marker: "o",
        color: "black",
      },
    ],
    xLabel: "CO₂ partial pressure / Pa",
    yLabel: A_LABEL,
    xLim: [0, key === "35" ? 70 : 80],
    yLim: [0, 35],
    legend: false,
  };
}

function fig8Data(): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const [key, op] of Object.entries(OPERATING)) {
    const k = key.slice(2);
    out[`op${k}_Ci`] = op.Ci;
    out[`op${k}_A`] = op.A;
    op.Ci.forEach((Ci, i) => {
      out[`supply${k}_${i}_C`] = [Ci, op.Ca[i]];
      out[`supply${k}_${i}_A`] = [op.A[i], 0];
    });
  }
  return out;
}

export const validations: Validation[] = [
  {
    id: "fig1",
    title: "Figure 1: A/Ci at 2 and 20 kPa O₂",
    columns: 2,
    scans: fig1Scans(),
    plots: [
      fig1Panel("a", "Cotton, grown at 35 Pa CO₂"),
      fig1Panel("b", "Grown at 65 Pa CO₂"),
    ],
    golden: golden(FIG1_SCANS, ["A"]),
  },
  {
    id: "fig2",
    title: "Figure 2: dark respiration",
    scans: {
      g35: scan({ T_leaf: linspace(12, 36, 241) }, ["R_dark"]),
      g65: scan({ T_leaf: linspace(12, 36, 241) }, ["R_dark"], true),
    },
    plots: [
      grownPair("R_dark", "Dark respiration / µmol m⁻² s⁻¹", [0, 4], [12, 36]),
    ],
    golden: golden(["g35", "g65"], ["R_dark"]),
  },
  {
    id: "fig3",
    title: "Figure 3: Vc,max, Jmax and TPU against leaf temperature",
    columns: 3,
    scans: {
      g35: scan({ T_leaf: linspace(10, 40, 301) }, ["Vcmax", "Jmax", "TPU"]),
      g65: scan(
        { T_leaf: linspace(10, 40, 301) },
        ["Vcmax", "Jmax", "TPU"],
        true,
      ),
    },
    plots: [
      grownPair("Vcmax", "Vc,max / µmol m⁻² s⁻¹", [0, 200], [10, 40]),
      grownPair("Jmax", "Jmax / µmol m⁻² s⁻¹", [0, 250], [10, 40]),
      grownPair("TPU", "TPU / µmol m⁻² s⁻¹", [0, 14], [10, 40]),
    ],
    golden: golden(["g35", "g65"], ["Vcmax", "Jmax", "TPU"]),
  },
  {
    id: "fig8",
    title: "Figure 8: net photosynthesis against CO₂",
    columns: 2,
    // PPFD 1000, 29 °C and 50 % relative humidity, the model defaults
    scans: {
      d35: scan({ Ci: linspace(5, 80, 376) }, ["A", "Ca", "gs"]),
      d65: scan({ Ci: linspace(5, 80, 376) }, ["A", "Ca", "gs"], true),
    },
    data: fig8Data(),
    plots: [
      fig8Panel("a", "35", "Cotton, grown at 35 Pa CO₂"),
      fig8Panel("b", "65", "Grown at 65 Pa CO₂"),
    ],
    golden: golden(["d35", "d65"], ["A", "Ca", "gs"]),
  },
];
