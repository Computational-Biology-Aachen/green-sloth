import { linspace } from "#lib/validation/helpers.js";
import type {
  Annotation,
  GoldenSeries,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 9.2 and 9.4–9.7, the chapter's figures with model lines. Fig 9.1 is a
 * stoichiometric schematic, and Figs 9.3 and 9.8 show measurements only (Fig
 * 9.8's Ja/4 is computed from measured A). Lines whose parameters the chapter
 * does not print (Figs 9.2, 9.6 wild type, 9.7 supply) were fitted to the
 * figures; see curatornotes.md.
 */
const steadyState = { kind: "steadyState" } as const;
type Over = Record<string, number>;

function scan(
  param: string,
  values: number[],
  set: Over,
  columns: string[],
): Scan {
  return {
    over: {
      [param]: values,
      ...Object.fromEntries(Object.entries(set).map(([k, v]) => [k, [v]])),
    },
    x: values,
    columns,
    simulate: steadyState,
  };
}

// Evaluated without a solver, so the TS engine and the exported notebook agree
// to rounding: a tight tolerance catches any drift between the two.
function golden(cols: Record<string, string[]>): Record<string, GoldenSeries> {
  return Object.fromEntries(
    Object.entries(cols).flatMap(([s, cs]) =>
      cs.map((c): [string, GoldenSeries] => [
        `${c}_${s}`,
        { x: `${s}.x`, y: `${s}.${c}`, tolerance: 1e-9 },
      ]),
    ),
  );
}

function curve(
  of: string,
  dash: LineSeries["dash"] = "solid",
  label?: string,
): LineSeries {
  return { of, x: `${of.split(".")[0]}.x`, label, color: "black", dash };
}

const note = (text: string, x: number, y: number): Annotation => ({
  text,
  x,
  y,
  size: 9,
});

const A_LABEL = "CO₂ assimilation rate / µmol m⁻² s⁻¹";
const CI_LABEL = "Intercellular pCO₂ / µbar";

/** A Γ* in µbar at 200 mbar O₂ as the model's γ* (Eqn 9.4). */
const gammaStar = (GammaStar: number) => GammaStar / (1000 * 200);

// Fig 9.2: wild-type and anti-SSU tobacco at 1000 µmol quanta, 25 °C (von
// Caemmerer et al. 1994). Vcmax, Jmax and Rd are not printed: fitted to the
// lines read off the figure, with Table 9.1's kinetics
const FIG2 = {
  wt_c: { Vcmax_25: 90.9, Rd_25: 3.71 },
  wt_j: { Jmax_25: 182.2, Rd_25: 1.51 },
  anti_c: { Vcmax_25: 37.4, Rd_25: 2.27 },
};

// Fig 9.4: Eqn 9.23 fitted to gross O₂ evolution (legend), drawn solid over
// the measured range and dotted beyond it, and Table 9.1's Jmax(T), both at
// 50 µmol m⁻² s⁻¹ at 25 °C
const FIG4_FIT = { Jmax_25: 50, E_J: 44.72, H_J: 210, S_J: 673 };
const FIG4_FVCB = { Jmax_25: 50 };

// Fig 9.6: tobacco with mutant Rubiscos, Eqn 9.9 with the legend's values.
// The wild type's are not printed: Vcmax and Rd fitted to its line
const FIG6: Record<string, Over> = {
  wt: { Vcmax_25: 83.5, Rd_25: 5.45 },
  l335: {
    Vcmax_25: 37,
    Kc_25: 318,
    Ko_25: 55.6,
    gamma_star_25: gammaStar(140),
    Rd_25: 2.5,
  },
  rubrum: {
    Vcmax_25: 42,
    Kc_25: 4461,
    Ko_25: 126,
    gamma_star_25: gammaStar(415),
    Rd_25: 1,
  },
};

// Fig 9.7: the demand function of Fig 9.5a at 1000 µmol quanta, and the supply
// function with the model's g and Ca (fitted to the figure). They meet at
// Ci = 273.2 µbar, a root of A_inf = A_supply found numerically.
const FIG7_CI = 273.237044994663;

const IRRADIANCES = [1000, 500, 300];
const CHLOROPLAST_CO2 = [500, 250, 100];

export const validations: Validation[] = [
  {
    id: "fig9_2",
    title: "Figure 9.2: A–Ci of wild-type and anti-Rubisco tobacco",
    scans: Object.fromEntries(
      Object.entries(FIG2).map(([k, set]) => [
        k,
        scan("Ci", linspace(0, 900, 361), set, [
          k.endsWith("_j") ? "Aj_inf" : "Ac_inf",
        ]),
      ]),
    ),
    plots: [
      {
        type: "line",
        x: "wt_c.x",
        y: [
          curve("wt_c.Ac_inf", "dashed", "Ac (Eqn 9.9)"),
          curve("wt_j.Aj_inf", "dotted", "Aj (Eqn 9.14)"),
          curve("anti_c.Ac_inf", "dashed"),
        ],
        xLabel: CI_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 900],
        yLim: [0, 45],
        legend: true,
        annotations: [
          note("wild type", 110, 30),
          note("anti-Rubisco", 550, 12),
        ],
      },
    ],
    golden: golden({
      wt_c: ["Ac_inf"],
      wt_j: ["Aj_inf"],
      anti_c: ["Ac_inf"],
    }),
  },
  {
    id: "fig9_4",
    title: "Figure 9.4: temperature dependence of electron transport",
    scans: {
      fit_low: scan("t_leaf", linspace(0, 7.5, 31), FIG4_FIT, ["Jmax"]),
      fit: scan("t_leaf", linspace(7.5, 37.5, 121), FIG4_FIT, ["Jmax"]),
      fit_high: scan("t_leaf", linspace(37.5, 50, 51), FIG4_FIT, ["Jmax"]),
      fvcb: scan("t_leaf", linspace(0, 50, 201), FIG4_FVCB, ["Jmax"]),
      // Eqn 9.24 for both parameter sets
      topt: {
        over: { E_J: [44.72, 37], H_J: [210, 220], S_J: [673, 710] },
        x: [1, 2],
        columns: ["Topt"],
        simulate: steadyState,
      },
    },
    plots: [
      {
        type: "line",
        x: "fvcb.x",
        y: [
          curve("fit.Jmax", "solid", "Eqn 9.23 fitted to the data"),
          curve("fit_low.Jmax", "dotted"),
          curve("fit_high.Jmax", "dotted"),
          curve("fvcb.Jmax", "dashed", "Farquhar et al. (1980), Table 9.1"),
        ],
        xLabel: "t / °C",
        yLabel: "Gross O₂ evolution / µmol m⁻² s⁻¹",
        xLim: [0, 50],
        yLim: [0, 80],
        legend: true,
      },
    ],
    golden: golden({
      fit_low: ["Jmax"],
      fit: ["Jmax"],
      fit_high: ["Jmax"],
      fvcb: ["Jmax"],
      topt: ["Topt"],
    }),
  },
  {
    id: "fig9_5",
    title: "Figure 9.5: modelled CO₂ and light responses",
    columns: 1,
    scans: {
      ac: scan("Ci", linspace(0, 700, 281), {}, ["Ac_inf"]),
      ...Object.fromEntries(
        IRRADIANCES.map((I) => [
          `i${I}`,
          scan("Ci", linspace(0, 700, 281), { I }, ["A_inf", "Aj_inf"]),
        ]),
      ),
      ...Object.fromEntries(
        CHLOROPLAST_CO2.map((Ci) => [
          `c${Ci}`,
          scan("I", linspace(0, 2000, 201), { Ci }, ["A_inf", "Aj_inf"]),
        ]),
      ),
    },
    plots: [
      {
        type: "line",
        panel: "a",
        x: "ac.x",
        y: [
          curve("ac.Ac_inf", "dotted", "Ac"),
          ...IRRADIANCES.map((I, i) =>
            curve(`i${I}.Aj_inf`, "dashed", i === 0 ? "Aj" : undefined),
          ),
          ...IRRADIANCES.map((I, i) =>
            curve(`i${I}.A_inf`, "solid", i === 0 ? "A" : undefined),
          ),
        ],
        xLabel: "Chloroplastic CO₂ / µbar",
        yLabel: A_LABEL,
        xLim: [0, 700],
        yLim: [0, 35],
        legend: true,
        annotations: [
          note("1000", 560, 25.5),
          note("500", 560, 19.5),
          note("300 µmol m⁻² s⁻¹", 400, 13.5),
        ],
      },
      {
        type: "line",
        panel: "b",
        x: "c500.x",
        y: [
          ...CHLOROPLAST_CO2.slice(1).map((c, i) =>
            curve(`c${c}.Aj_inf`, "dashed", i === 0 ? "Aj" : undefined),
          ),
          ...CHLOROPLAST_CO2.map((c, i) =>
            curve(`c${c}.A_inf`, "solid", i === 0 ? "A" : undefined),
          ),
        ],
        xLabel: "Irradiance / µmol quanta m⁻² s⁻¹",
        yLabel: A_LABEL,
        xLim: [0, 2000],
        yLim: [0, 35],
        legend: true,
        annotations: [
          note("c = 500", 1650, 30.5),
          note("c = 250", 1650, 17.5),
          note("c = 100", 1650, 4.5),
        ],
      },
    ],
    golden: golden({
      ac: ["Ac_inf"],
      ...Object.fromEntries(
        IRRADIANCES.map((I) => [`i${I}`, ["A_inf", "Aj_inf"]]),
      ),
      ...Object.fromEntries(
        CHLOROPLAST_CO2.map((c) => [`c${c}`, ["A_inf", "Aj_inf"]]),
      ),
    }),
  },
  {
    id: "fig9_6",
    title: "Figure 9.6: tobacco with mutant Rubiscos",
    scans: Object.fromEntries(
      Object.entries(FIG6).map(([k, set]) => [
        k,
        scan("Ci", linspace(0, 1800, 361), set, ["Ac_inf"]),
      ]),
    ),
    plots: [
      {
        type: "line",
        x: "wt.x",
        y: [
          curve("wt.Ac_inf", "solid", "Wild type"),
          curve("l335.Ac_inf", "dashed", "L335"),
          curve("rubrum.Ac_inf", "dotted", "Rubrum"),
        ],
        xLabel: CI_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 1800],
        yLim: [-5, 35],
        hLines: [{ value: 0, color: "black", lineWidth: 0.5 }],
        legend: true,
      },
    ],
    golden: golden({
      wt: ["Ac_inf"],
      l335: ["Ac_inf"],
      rubrum: ["Ac_inf"],
    }),
  },
  {
    id: "fig9_7",
    title: "Figure 9.7: supply and demand functions",
    scans: {
      demand: scan("Ci", linspace(0, 600, 241), {}, ["A_inf"]),
      supply: scan("Ci", [FIG7_CI, 383], {}, ["A_supply"]),
      // The drop line at Ci: A_supply from g = 0 (A = 0) to the model's g
      drop: {
        over: { Ci: [FIG7_CI, FIG7_CI], g: [0, 0.2] },
        x: [FIG7_CI, FIG7_CI],
        columns: ["A_supply"],
        simulate: steadyState,
      },
    },
    plots: [
      {
        type: "line",
        x: "demand.x",
        y: [
          curve("demand.A_inf", "solid", "Demand function"),
          curve("supply.A_supply", "dashed", "Supply function, A = g(Ca − Ci)"),
          { ...curve("drop.A_supply"), lineWidth: 1 },
        ],
        xLabel: CI_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 600],
        yLim: [0, 35],
        legend: true,
        annotations: [
          { ...note("Ci", 265, 2), align: "right" },
          note("Ca", 390, 2),
        ],
      },
    ],
    // The drop line only redraws supply's first point (its two points share
    // one x, which the notebook check can't match by x)
    golden: golden({ demand: ["A_inf"], supply: ["A_supply"] }),
  },
];
