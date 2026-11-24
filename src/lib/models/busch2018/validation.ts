import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 3 and 4 and Supplementary Fig S4, every model-output figure with
 * printed parameters. Fig 1 is a schematic, Figs 2a, 2c, 2d and S2 are data,
 * and the lines of Fig 2b and S1 (and Fig S3's values) are averages of fits to
 * individual plants whose parameters aren't printed (see curatornotes.md).
 */
const steadyState = { kind: "steadyState" } as const;
type Over = Record<string, number>;

function scan(C: number[], set: Over, columns: string[]): Scan {
  return {
    over: {
      C,
      ...Object.fromEntries(Object.entries(set).map(([k, v]) => [k, [v]])),
    },
    x: C,
    columns,
    simulate: steadyState,
  };
}

// Evaluated without a solver, so the TS engine and the exported notebook agree
// to rounding: a tight tolerance catches any drift between the two.
function golden(
  pairs: Array<[scan: string, column: string]>,
): Record<string, GoldenSeries> {
  return Object.fromEntries(
    pairs.map(([s, c]): [string, GoldenSeries] => [
      `${c}_${s}`,
      { x: `${s}.x`, y: `${s}.${c}`, tolerance: 1e-9 },
    ]),
  );
}

const A_LABEL = "A / µmol m⁻² s⁻¹";
const CI_LABEL = "Ci / Pa";
const CC_LABEL = "Cc / Pa";

const RUBISCO = "#8b0000";
const RUBP = "#118a11";
const TPU = "#ff8c00";
const PURPLE = "#8b008b";
const TEAL = "#008080";

/**
 * Fig 3's measured O₂ partial pressures: 21 % and 0.2 % of about 94 kPa
 * (Canberra), fitted to the N-limit kink of Fig 3b (see curatornotes.md).
 */
const O_AMBIENT = 19.7;
const O_MINIMAL = 0.19;

/** The KNO₃-fertilised fit of Fig 3a (ambient O₂). */
const FIG3A: Over = {
  O: O_AMBIENT,
  Vcmax: 103.9,
  J: 185.2,
  Tp: 11.5,
  Rd: 1.29,
  alpha_G_max: 0.09,
  alpha_S_max: 0.38,
  N_max: 1.21,
};

// ---- Fig 3: A–Ci fit, the effective N assimilation and the O₂ response

const CI = linspace(5, 200, 196);

const fig3: Validation = {
  id: "fig3",
  title: "Figure 3: A–Ci fit and photorespiratory N assimilation (sunflower)",
  columns: 1,
  scans: {
    fit: scan(CI, FIG3A, [
      "Ac",
      "Aj",
      "Ap",
      "A",
      "alpha_G",
      "alpha_S",
      "alpha_total",
      "N_G",
      "N_S",
      "N_total",
    ]),
  },
  plots: [
    {
      type: "line",
      panel: "a",
      title: "Fitted values of Fig 3a",
      x: "fit.x",
      y: [
        { of: "fit.Ac", label: "Fitted Ac", color: RUBISCO },
        { of: "fit.Aj", label: "Fitted Aj", color: RUBP },
        { of: "fit.Ap", label: "Fitted Ap", color: TPU },
      ],
      xLabel: CI_LABEL,
      yLabel: A_LABEL,
      xLim: [0, 200],
      yLim: [0, 45],
      legendPosition: "bottom",
    },
    {
      type: "line",
      panel: "b",
      title: "Effective N assimilation and exported fractions",
      x: "fit.x",
      y: [
        { of: "fit.N_total", label: "N_total", color: PURPLE },
        { of: "fit.N_S", label: "N_S", color: PURPLE, dash: "dashdot" },
        { of: "fit.N_G", label: "N_G", color: PURPLE, dash: "dotted" },
        {
          of: "fit.alpha_total",
          label: "α_total",
          color: TEAL,
          axis: "right",
        },
        {
          of: "fit.alpha_S",
          label: "α_S",
          color: TEAL,
          dash: "dashdot",
          axis: "right",
        },
        {
          of: "fit.alpha_G",
          label: "α_G",
          color: TEAL,
          dash: "dotted",
          axis: "right",
        },
      ],
      xLabel: CI_LABEL,
      yLabel: "Effective N / µmol m⁻² s⁻¹",
      yRightLabel: "Effective α (unitless)",
      xLim: [0, 200],
      yLim: [0, 1.38],
      yRightLim: [0, 0.5],
      yColor: PURPLE,
      yRightColor: TEAL,
      legendPosition: "right",
    },
  ],
  golden: golden(
    ["Ac", "Aj", "Ap", "A", "alpha_total", "N_total"].map((c) => ["fit", c]),
  ),
};

/** Fig 3c: one parameter set at both O₂, only Vcmax differing. */
const FIG3C: Over = {
  J: 168.7,
  Tp: 10.2,
  Rd: 1.29,
  alpha_G_max: 0.09,
  alpha_S_max: 0.38,
  N_max: 1.21,
};

const fig3c: Validation = {
  id: "fig3c",
  title: "Figure 3c: CO₂ response at ambient and minimal O₂",
  scans: {
    ambient: scan(CI, { ...FIG3C, O: O_AMBIENT, Vcmax: 92.4 }, ["A"]),
    minimal: scan(
      linspace(1, 200, 200),
      {
        ...FIG3C,
        O: O_MINIMAL,
        Vcmax: 62.4,
      },
      ["A"],
    ),
  },
  plots: [
    {
      type: "line",
      panel: "c",
      title: "KNO₃-fertilised sunflower",
      x: "ambient.x",
      y: [
        { of: "ambient.A", label: "Model (ambient [O₂])", color: TPU },
        {
          of: "minimal.A",
          x: "minimal.x",
          label: "Model (minimal [O₂])",
          color: "#1f8fd0",
        },
      ],
      xLabel: CI_LABEL,
      yLabel: A_LABEL,
      xLim: [0, 200],
      yLim: [0, 37],
      legendPosition: "bottom",
    },
  ],
  golden: golden([
    ["ambient", "A"],
    ["minimal", "A"],
  ]),
};

// ---- Fig 4: glycine vs serine export at light saturation and light limitation

// A theoretical figure: its N-limit kinks (95, 55 and 67 Pa) sit at 21 kPa O₂
const FIG4: Over = { O: 21, Vcmax: 100, Tp: 11.5, Rd: 1, N_max: 1.5 };

/** No export, glycine only, serine only and the mix of the insets. */
const EXPORTS: Record<string, Over> = {
  none: { alpha_G_max: 0, alpha_S_max: 0 },
  gly: { alpha_G_max: 0.5, alpha_S_max: 0 },
  ser: { alpha_G_max: 0, alpha_S_max: 0.4 },
  mix: { alpha_G_max: 0.1, alpha_S_max: 0.35 },
};
const DASH = { none: "solid", gly: "dashed", ser: "dotted" } as const;
const MAIN_LABEL = {
  none: "no N assim.",
  gly: "α_G^max = 0.5",
  ser: "α_S^max = 0.4",
};
const INSET: Array<[string, string, string]> = [
  ["gly", "α_G^max = 0.5", "#00008b"],
  ["ser", "α_S^max = 0.4", "#8b008b"],
  ["mix", "α_G^max = 0.10 and α_S^max = 0.35", "#5f9ea0"],
];

const CC = linspace(5, 150, 291);

/** Fig 4a is light-saturated: J high enough that Aj never limits (not printed). */
const J_SATURATED = 1000;

function fig4Scans(prefix: string, J: number): Record<string, Scan> {
  return Object.fromEntries(
    Object.entries(EXPORTS).map(([k, e]) => [
      `${prefix}_${k}`,
      scan(CC, { ...FIG4, ...e, J }, ["Ac", "Aj", "Ap", "A"]),
    ]),
  );
}

function inset(prefix: string, yLim: [number, number]): LinePlot {
  return {
    type: "line",
    title: "Inset: increase in A due to N assimilation",
    x: `${prefix}_none.x`,
    y: INSET.map(([k, label, color]): LineSeries => ({
      of: `100 * (${prefix}_${k}.A / ${prefix}_none.A - 1)`,
      label,
      color,
    })),
    xLabel: CC_LABEL,
    yLabel: "Increase in A due to N assimilation / %",
    xLim: [0, 150],
    yLim,
    hLines: [{ value: 0, color: "black", lineWidth: 1 }],
  };
}

const fig4: Validation = {
  id: "fig4",
  title: "Figure 4: CO₂ response with amino acid export as glycine and serine",
  columns: 2,
  scans: { ...fig4Scans("sat", J_SATURATED), ...fig4Scans("lim", 65) },
  plots: [
    {
      type: "line",
      panel: "a",
      title: "Light-saturated",
      x: "sat_none.x",
      y: (["none", "gly", "ser"] as const).flatMap((k): LineSeries[] => [
        {
          of: `sat_${k}.Ac`,
          label: `Ac (${MAIN_LABEL[k]})`,
          color: RUBISCO,
          dash: DASH[k],
        },
        {
          of: `sat_${k}.Ap`,
          label: `Ap (${MAIN_LABEL[k]})`,
          color: TPU,
          dash: DASH[k],
        },
      ]),
      xLabel: CC_LABEL,
      yLabel: A_LABEL,
      xLim: [0, 150],
      yLim: [0, 52],
    },
    inset("sat", [0, 20]),
    {
      type: "line",
      panel: "b",
      title: "Light-limited (J = 65)",
      x: "lim_none.x",
      y: (["none", "gly", "ser"] as const).map((k): LineSeries => ({
        of: `lim_${k}.Aj`,
        label: `Aj (${MAIN_LABEL[k]})`,
        color: RUBP,
        dash: DASH[k],
      })),
      xLabel: CC_LABEL,
      yLabel: A_LABEL,
      xLim: [0, 150],
      yLim: [0, 16],
    },
    inset("lim", [-17, 7]),
  ],
  golden: golden([
    ...Object.keys(EXPORTS).flatMap((k): Array<[string, string]> => [
      [`sat_${k}`, "Ac"],
      [`sat_${k}`, "Ap"],
      [`sat_${k}`, "A"],
      [`lim_${k}`, "A"],
    ]),
  ]),
};

// ---- Fig S4: Vo under each limitation, with the parameters of Fig 3a

const figS4: Validation = {
  id: "figS4",
  title: "Supplementary Figure S4: modelled rates of RuBP oxygenation",
  scans: {
    // From just above Γ* (3.5 Pa), below which min(Ac, Aj, Ap) picks the
    // wrong limitation
    vo: scan(linspace(4, 200, 197), FIG3A, ["Vo_c", "Vo_j", "Vo_p", "Vo"]),
  },
  plots: [
    {
      type: "line",
      x: "vo.x",
      y: [
        { of: "vo.Vo_c", label: "Vo Rubisco-limited", color: RUBISCO },
        { of: "vo.Vo_j", label: "Vo RuBP regeneration-limited", color: RUBP },
        { of: "vo.Vo_p", label: "Vo TPU-limited", color: TPU },
        { of: "vo.Vo", label: "actual Vo", color: "black", dash: "dashed" },
      ],
      xLabel: CC_LABEL,
      yLabel: "Vo / µmol m⁻² s⁻¹",
      xLim: [0, 200],
      yLim: [0, 17],
    },
  ],
  // Vo_p is unbounded below C = Γ*(1 + 3αG + 4αS), so it isn't locked
  golden: golden([
    ["vo", "Vo_c"],
    ["vo", "Vo_j"],
    ["vo", "Vo"],
  ]),
};

export const validations: Validation[] = [fig3, fig3c, fig4, figS4];
