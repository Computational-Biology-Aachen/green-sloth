import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 2, 3, 5, 8 and 9. Fig 1 is a schematic without values, Fig 7 is data,
 * and Figs 4 and 6 plot the results of least-squares regressions, which the
 * validation language cannot express. Parameters the paper does not print
 * (Rd, and gi for the Eqn 10 fits of Fig 5) were fitted to the figures; see
 * curatornotes.md.
 */
const steadyState = { kind: "steadyState" } as const;
type Over = Record<string, number>;

function scan(Ci: number[], set: Over, columns: string[]): Scan {
  return {
    over: {
      Ci,
      ...Object.fromEntries(Object.entries(set).map(([k, v]) => [k, [v]])),
    },
    // Explicit, so a single-point scan has its x too
    x: Ci,
    columns,
    simulate: steadyState,
  };
}

// Evaluated without a solver, so the TS engine and the exported notebook agree
// to rounding: a tight tolerance catches any drift between the two.
function golden(cols: Record<string, string>): Record<string, GoldenSeries> {
  return Object.fromEntries(
    Object.entries(cols).map(([s, c]): [string, GoldenSeries] => [
      `${c}_${s}`,
      { x: `${s}.x`, y: `${s}.${c}`, tolerance: 1e-9 },
    ]),
  );
}

/** Rubisco kinetics as model parameters; Γ* enters through Eqn 5. */
function kinetics(GammaStar: number, Kc: number, Ko: number, O = 210): Over {
  return { O, S_co: (500 * O) / GammaStar, Kc, Ko };
}

/**
 * Table 2's caption: Arrhenius normalised to 25 °C, E in kJ mol⁻¹. The caption
 * prints `exp[(T − 298.15)/E 298.15 RT]`, a typesetting slip for
 * `exp[(T − 298.15) E / (298.15 R T)]`.
 */
function at(p25: number, E: number, T: number): number {
  return p25 * Math.exp(((T - 25) * E) / (298.15 * 0.008314 * (T + 273.15)));
}

// Table 2: Jordan & Ogren (1984)
const JO84 = kinetics(45.146, 274.22, 418.29);
const A_LABEL = "An / µmol m⁻² s⁻¹";
const CI_UBAR = "Ci / µbar";
const CI_UMOL = "Ci / µmol mol⁻¹";

function curve(
  of: string,
  label?: string,
  dash: LineSeries["dash"] = "solid",
): LineSeries {
  return { of, x: `${of.split(".")[0]}.x`, label, color: "black", dash };
}

function markers(
  of: string,
  marker: LineSeries["marker"],
  filled: boolean,
): LineSeries {
  return {
    of,
    x: `${of.split(".")[0]}.x`,
    style: "markers",
    marker,
    color: "black",
    markerFace: filled ? "black" : "none",
  };
}

// Fig 2: the Douglas-fir shoot at 22 °C, three kinetic sets; Rd fitted
const FIG2: Record<string, { set: Over; Vcmax: number; Rd: number }> = {
  jo84: {
    set: kinetics(
      at(45.146, 29.213, 22),
      at(274.22, 70.372, 22),
      at(418.29, 14.351, 22),
    ),
    Vcmax: 28,
    Rd: 1.47,
  },
  // Ci* used as Γ*, as with gi = ∞
  b01: {
    set: kinetics(
      at(42.893, 37.83, 22),
      at(406.07, 79.43, 22),
      at(276.9, 36.38, 22),
    ),
    Vcmax: 40,
    Rd: 1.44,
  },
  // Given at 22 °C in the legend. With the printed Vcmax = 33 the curve ends
  // 6 % below the drawn one, so Vcmax and Rd are fitted to the drawn curve
  b02: { set: kinetics(33.86, 195.41, 150.46), Vcmax: 36.3, Rd: 1.68 },
};

// Fig 3: Jordan & Ogren at 25 °C; Rd fitted to the filled points
const FIG3: Record<string, Over> = {
  a_eq14: { Vcmax: 33, Rd: -0.16 },
  a_eq10: { Vcmax: 57, Rd: -0.95, gi: 0.1 },
  b_eq14: { Vcmax: 30, Rd: -1.07 },
  b_eq10: { Vcmax: 56, Rd: -1.68, gi: 0.15 },
};

// Fig 5: the ideal leaf (model defaults) at two gi, and the fits with
// Kc(1 + O/Ko) and Γ* overestimated by 20 and 10 %. Vcmax and Jmax are printed,
// Rd and the fitted gi are not.
const OVER = kinetics(45.146 * 1.1, 274.22 * 1.2, 418.29);
const FIG5 = {
  a: {
    gi: 0.2,
    eq14: { Vcmax: 46.5, Rd: 0.18 },
    eq15: { Jmax: 111.1, Rd: 0.606 },
    eq10c: { Vcmax: 59.4, Rd: 0.088, gi: 0.2447 },
    eq10j: { Jmax: 112.9, Rd: 0.594, gi: 0.301 },
  },
  b: {
    gi: 0.05,
    eq14: { Vcmax: 24.5, Rd: 0.156 },
    eq15: { Jmax: 100.5, Rd: 0.705 },
    eq10c: { Vcmax: 59.8, Rd: 0.048, gi: 0.052 },
    eq10j: { Jmax: 113.2, Rd: 0.595, gi: 0.0535 },
  },
};
const CI_FILLED_C = [40, 80, 120, 160, 200, 240];
// The open (unfitted) points: circles still belong to the Rubisco-limited part
const CI_OPEN = {
  a: { o: [], D: [300, 350, 400] },
  b: { o: [300], D: [350, 400] },
};
const CI_FILLED_J = [500, 700, 900, 1100, 1300, 1500];

function fig5Scans(p: "a" | "b"): Record<string, Scan> {
  const f = FIG5[p];
  const ci = linspace(0, 1600, 321);
  return {
    [`${p}_pc`]: scan(CI_FILLED_C, { gi: f.gi }, ["An"]),
    ...(CI_OPEN[p].o.length > 0
      ? { [`${p}_poc`]: scan(CI_OPEN[p].o, { gi: f.gi }, ["An"]) }
      : {}),
    [`${p}_poj`]: scan(CI_OPEN[p].D, { gi: f.gi }, ["An"]),
    [`${p}_pj`]: scan(CI_FILLED_J, { gi: f.gi }, ["An"]),
    [`${p}_eq14`]: scan(ci, { ...OVER, ...f.eq14 }, ["Ac_inf"]),
    [`${p}_eq15`]: scan(ci, { ...OVER, ...f.eq15 }, ["Aj_inf"]),
    [`${p}_eq10c`]: scan(ci, { ...OVER, ...f.eq10c }, ["Ac"]),
    [`${p}_eq10j`]: scan(ci, { ...OVER, ...f.eq10j }, ["Aj"]),
  };
}

function fig5Panel(p: "a" | "b"): LinePlot {
  return {
    type: "line",
    panel: p,
    title: `gi = ${FIG5[p].gi} mol m⁻² s⁻¹`,
    x: `${p}_eq14.x`,
    y: [
      curve(`${p}_eq14.Ac_inf`, `Eqn 14: Vcmax ${FIG5[p].eq14.Vcmax}`),
      curve(`${p}_eq15.Aj_inf`, `Eqn 15: Jmax ${FIG5[p].eq15.Jmax}`),
      curve(`${p}_eq10c.Ac`, `Eqn 10: Vcmax ${FIG5[p].eq10c.Vcmax}`, "dotted"),
      curve(`${p}_eq10j.Aj`, `Eqn 10: Jmax ${FIG5[p].eq10j.Jmax}`, "dotted"),
      markers(`${p}_pc.An`, "o", true),
      ...(CI_OPEN[p].o.length > 0 ? [markers(`${p}_poc.An`, "o", false)] : []),
      markers(`${p}_poj.An`, "D", false),
      markers(`${p}_pj.An`, "D", true),
    ],
    xLabel: CI_UMOL,
    yLabel: A_LABEL,
    xLim: [0, 1600],
    yLim: [-5, 40],
    hLines: [{ value: 0, color: "black", lineWidth: 0.5 }],
    legend: true,
  };
}

// Figs 8 and 9: Table 3, gi = 0.27. 21 % O₂ is 200 mbar (Table 3), so the
// other levels scale by 200/21.
const TABLE3 = {
  gi: 0.27,
  Vcmax: 34.85,
  Rd: 0.66,
  Kc: 327.0,
  Ko: 282.6,
  S_co: 2291,
  // Only Rubisco limits this leaf with reduced Rubisco content
  Jmax: 1e6,
  I: 1500,
};
const O2_PERCENT = [2, 5, 21, 35, 50];
const mbar = (pct: number) => (pct * 200) / 21;

/**
 * Fig 8's curves are the five separate Eqn 10 fits, whose Γ, Kc(1 + O/Ko) and
 * Vcmax − Rd are the points of Fig 9 (read off the figure; not tabulated).
 * Eqn 7 depends only on these three, so Rd is held at Table 3's value and the
 * kinetic parameters are set to give them.
 */
const FIG9_POINTS: Record<number, [Gamma: number, Km: number, V: number]> = {
  2: [13, 327, 36.0],
  5: [16.5, 400, 36.0],
  21: [55, 518, 34.1],
  35: [88.5, 805, 35.8],
  50: [122, 822, 32.7],
};

function perO2Fit(pct: number): Over {
  const [Gamma, Km, V] = FIG9_POINTS[pct];
  const { Rd, Ko } = TABLE3;
  const O = mbar(pct);
  const Vcmax = V + Rd;
  // Eqn 17 solved for Γ*
  const GammaStar = (Gamma * V - Km * Rd) / Vcmax;
  return {
    ...TABLE3,
    O,
    Vcmax,
    Kc: Km / (1 + O / Ko),
    S_co: (500 * O) / GammaStar,
  };
}

function fig9Points(col: string): LineSeries {
  return {
    of: `fits.${col}`,
    x: "fits.x",
    style: "markers",
    marker: "o",
    color: "black",
    markerFace: "black",
  };
}

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: Douglas-fir, three sets of Rubisco kinetics",
    scans: Object.fromEntries(
      Object.entries(FIG2).map(([k, { set, Vcmax, Rd }]) => [
        k,
        scan(linspace(0, 1500, 301), { ...set, Vcmax, Rd }, ["Ac_inf"]),
      ]),
    ),
    plots: [
      {
        type: "line",
        x: "jo84.x",
        y: [
          curve("jo84.Ac_inf", "Jordan & Ogren (1984): 28", "dotted"),
          curve("b01.Ac_inf", "Bernacchi et al. (2001): 40"),
          curve(
            "b02.Ac_inf",
            "Bernacchi et al. (2002): 33 (fit: 36.3)",
            "dashed",
          ),
        ],
        xLabel: CI_UBAR,
        yLabel: A_LABEL,
        xLim: [0, 1500],
        yLim: [-5, 30],
        hLines: [{ value: 0, color: "black", lineWidth: 0.5 }],
        legend: true,
      },
    ],
    golden: golden({ jo84: "Ac_inf", b01: "Ac_inf", b02: "Ac_inf" }),
  },
  {
    id: "fig3",
    title: "Figure 3: Eqn 14 against Eqn 10 on measured curves",
    columns: 1,
    scans: Object.fromEntries(
      Object.entries(FIG3).map(([k, fit]) => [
        k,
        scan(
          linspace(0, k.startsWith("a") ? 600 : 1600, 321),
          { ...JO84, ...fit },
          [k.endsWith("eq14") ? "Ac_inf" : "Ac"],
        ),
      ]),
    ),
    plots: [
      {
        type: "line",
        panel: "a",
        title: "Sun & Ehleringer (1986)",
        x: "a_eq14.x",
        y: [
          curve("a_eq14.Ac_inf", "Eqn 14: Vcmax 33"),
          curve("a_eq10.Ac", "Eqn 10: Vcmax 57, gi 0.1", "dotted"),
        ],
        xLabel: CI_UMOL,
        yLabel: A_LABEL,
        xLim: [0, 600],
        yLim: [0, 20],
        legend: true,
      },
      {
        type: "line",
        panel: "b",
        title: "Siebke et al. (1990)",
        x: "b_eq14.x",
        y: [
          curve("b_eq14.Ac_inf", "Eqn 14: Vcmax 30"),
          curve("b_eq10.Ac", "Eqn 10: Vcmax 56, gi 0.15", "dotted"),
        ],
        xLabel: CI_UMOL,
        yLabel: A_LABEL,
        xLim: [0, 1600],
        yLim: [-3, 40],
        hLines: [{ value: 0, color: "black", lineWidth: 0.5 }],
        legend: true,
      },
    ],
    golden: golden({
      a_eq14: "Ac_inf",
      a_eq10: "Ac",
      b_eq14: "Ac_inf",
      b_eq10: "Ac",
    }),
  },
  {
    id: "fig5",
    title: "Figure 5: fits to ideal A–Ci curves",
    columns: 1,
    scans: { ...fig5Scans("a"), ...fig5Scans("b") },
    plots: [fig5Panel("a"), fig5Panel("b")],
    golden: golden(
      Object.fromEntries(
        (["a", "b"] as const).flatMap((p) => [
          [`${p}_pc`, "An"],
          [`${p}_pj`, "An"],
          [`${p}_eq14`, "Ac_inf"],
          [`${p}_eq15`, "Aj_inf"],
          [`${p}_eq10c`, "Ac"],
          [`${p}_eq10j`, "Aj"],
        ]),
      ),
    ),
  },
  {
    id: "fig8",
    title: "Figure 8: O₂ response of transgenic tobacco",
    scans: Object.fromEntries(
      O2_PERCENT.map((pct) => [
        `o${pct}`,
        scan(linspace(0, 1600, 321), perO2Fit(pct), ["Ac"]),
      ]),
    ),
    plots: [
      {
        type: "line",
        x: "o2.x",
        y: O2_PERCENT.map((pct) => curve(`o${pct}.Ac`, `${pct} % O₂`)),
        xLabel: CI_UBAR,
        yLabel: A_LABEL,
        xLim: [0, 1600],
        yLim: [0, 35],
        legend: true,
      },
    ],
    golden: golden(
      Object.fromEntries(O2_PERCENT.map((pct) => [`o${pct}`, "Ac"])),
    ),
  },
  {
    id: "fig9",
    title: "Figure 9: O₂ dependence of Γ, Kc(1 + O/Ko) and Vcmax − Rd",
    columns: 1,
    scans: {
      line: {
        over: {
          O: linspace(0, 500, 251),
          ...Object.fromEntries(
            Object.entries(TABLE3).map(([k, v]) => [k, [v]]),
          ),
        },
        columns: ["Gamma", "Km", "Vcmax_minus_Rd"],
        simulate: steadyState,
      },
      fits: {
        over: Object.fromEntries(
          Object.keys(perO2Fit(2)).map((k) => [
            k,
            O2_PERCENT.map((pct) => perO2Fit(pct)[k]),
          ]),
        ),
        x: O2_PERCENT.map(mbar),
        columns: ["Gamma", "Km", "Vcmax_minus_Rd"],
        simulate: steadyState,
      },
    },
    plots: [
      {
        type: "line",
        panel: "a",
        x: "line.x",
        y: [curve("line.Gamma"), fig9Points("Gamma")],
        xLabel: "O₂ / mbar",
        yLabel: "Γ / µbar",
        xLim: [0, 500],
        yLim: [0, 140],
        legend: false,
      },
      {
        type: "line",
        panel: "b",
        x: "line.x",
        y: [curve("line.Km"), fig9Points("Km")],
        xLabel: "O₂ / mbar",
        yLabel: "Kc(1 + O/Ko) / µbar",
        xLim: [0, 500],
        yLim: [0, 900],
        legend: false,
      },
      {
        type: "line",
        panel: "c",
        x: "fits.x",
        y: [fig9Points("Vcmax_minus_Rd")],
        xLabel: "O₂ / mbar",
        yLabel: "Vcmax − Rd / µmol m⁻² s⁻¹",
        xLim: [0, 500],
        yLim: [0, 45],
        legend: false,
      },
    ],
    golden: {
      ...golden({ line: "Gamma" }),
      Km_line: { x: "line.x", y: "line.Km", tolerance: 1e-9 },
      Gamma_fits: { x: "fits.x", y: "fits.Gamma", tolerance: 1e-9 },
      Km_fits: { x: "fits.x", y: "fits.Km", tolerance: 1e-9 },
      Vcmax_minus_Rd_fits: {
        x: "fits.x",
        y: "fits.Vcmax_minus_Rd",
        tolerance: 1e-9,
      },
    },
  },
];
