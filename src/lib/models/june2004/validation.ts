import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 1–5: Eqn 2 with the fitted parameters of Tables 1 and 2, as the paper
 * draws them. The measured points behind Figs 1–3 are not tabulated.
 */
type Fit = [J_To: number, To: number, Omega: number];
const steadyState = { kind: "steadyState" } as const;

function scan(T_leaf: number[], [J_To, To, Omega]: Fit, columns = ["J"]): Scan {
  return {
    over: { T_leaf, J_To: [J_To], To: [To], Omega: [Omega] },
    columns,
    simulate: steadyState,
  };
}

function scans(T_leaf: number[], fits: Record<string, Fit>) {
  return Object.fromEntries(
    Object.entries(fits).map(([k, fit]) => [k, scan(T_leaf, fit)]),
  );
}

// Evaluated without a solver, so this model and the notebook's reference
// implementation (the goldens) agree to rounding: a tight tolerance catches any
// drift between the two.
function golden(names: string[], col = "J"): Record<string, GoldenSeries> {
  return Object.fromEntries(
    names.map((k): [string, GoldenSeries] => [
      `${col}_${k}`,
      { x: `${k}.x`, y: `${k}.${col}`, tolerance: 1e-9 },
    ]),
  );
}

const J_LABEL = "J / µmol e⁻ m⁻² s⁻¹";
const T_LABEL = "Leaf temperature / °C";

function family(
  labels: Record<string, string>,
  p: Omit<LinePlot, "type" | "x" | "y">,
): LinePlot {
  const keys = Object.keys(labels);
  // The paper tells the curves apart by their data symbols; dashes do here
  const dashes = ["solid", "dashed", "dotted", "dashdot"] as const;
  const y: LineSeries[] = keys.map((k, i) => ({
    of: `${k}.J`,
    x: `${k}.x`,
    label: labels[k],
    color: "black",
    dash: dashes[i],
  }));
  return {
    type: "line",
    x: `${keys[0]}.x`,
    y,
    xLabel: T_LABEL,
    yLabel: J_LABEL,
    legend: true,
    ...p,
  };
}

const SOYBEAN_N: Record<string, Fit> = {
  n16: [240, 35.4, 17.6],
  n5: [135, 36.1, 18.3],
  n2: [113, 37.7, 18.7],
};
const PINUS: Record<string, Fit> = {
  hn: [63.1, 34.6, 23.9],
  ln: [47.9, 33.8, 23.8],
};
const SOYBEAN_T: Record<string, Fit> = {
  g20: [240, 35.4, 17.6],
  g25: [219, 37.8, 16.7],
  g32: [183, 39.3, 19.8],
};
const ABUTILON: Record<string, Fit> = {
  g16: [202, 28.4, 22.3],
  g20: [244.7, 29.7, 21.2],
  g28: [268.8, 35.2, 21.9],
  g32: [294.1, 37.7, 21.4],
};
const NORMALISED: Record<string, Fit> = {
  t20w15: [1, 20, 15],
  t35w15: [1, 35, 15],
  t30w15: [1, 30, 15],
  t30w20: [1, 30, 20],
};

// Fig 4: (To, Ω) of Tables 1 and 2. Tobacco grown at 25/20 and 35/28 °C is
// hollow, its To lying beyond the measured range; Wohlfahrt et al. (1999)'s
// points are not tabulated.
const GLYCINE = [
  [35.4, 17.6],
  [36.1, 18.3],
  [37.7, 18.7],
  [32.9, 24.1],
  [34.4, 22.7],
  [36.4, 19.4],
  [37.8, 16.7],
  [38.1, 16.2],
  [39.3, 19.8],
  [39.6, 17.1],
  [39.1, 18.0],
  [38.9, 18.2],
  [37.6, 14.5],
  [39.8, 15.7],
  [35.2, 16.7],
];
const HERBS = [
  [28.4, 22.3],
  [29.7, 21.2],
  [35.2, 21.9],
  [37.7, 21.4],
  [33.6, 20.5],
  [36.5, 17.0],
  [36.6, 13.9],
  [32.7, 25.1],
  [34.0, 20.7],
  [37.3, 18.7],
];
const HERBS_EXTRAPOLATED = [
  [55.6, 30.2],
  [55.7, 34.7],
];
const TREES = [
  [30.6, 16.9],
  [35.9, 21.6],
  [31.8, 22.0],
  [34.7, 18.7],
  [32.1, 16.7],
  [35.7, 18.5],
  [33.8, 23.8],
  [34.6, 23.9],
  [21.9, 14.3],
  [23.8, 15.0],
  [20.7, 13.9],
  [21.9, 14.3],
  [35.6, 12.5],
  [40.0, 23.6],
  [39.4, 22.5],
  [40.6, 25.8],
  [39.2, 16.9],
];

function points(name: string, pts: number[][]): Record<string, number[]> {
  return {
    [`${name}_To`]: pts.map((p) => p[0]),
    [`${name}_Omega`]: pts.map((p) => p[1]),
  };
}

function pointSeries(
  name: string,
  label: string,
  marker: LineSeries["marker"],
  face = "black",
): LineSeries {
  return {
    of: `data.${name}_Omega`,
    x: `data.${name}_To`,
    label,
    style: "markers",
    marker,
    color: "black",
    markerFace: face,
  };
}

export const validations: Validation[] = [
  {
    id: "fig1",
    title: "Figure 1: one soybean leaf",
    scans: {
      leaf: scan(linspace(15, 45, 301), [257, 33, 23.8], ["J", "phi_PSII"]),
    },
    plots: [
      {
        type: "line",
        x: "leaf.x",
        y: [
          { of: "leaf.phi_PSII", color: "black" },
          { of: "leaf.J", color: "black", axis: "right", lineWidth: 0 },
        ],
        xLabel: "Leaf temperature (T_L) / °C",
        yLabel: "φPSII",
        yRightLabel: J_LABEL,
        xLim: [15, 45],
        yLim: [0.3, 0.6],
        yRightLim: [150, 275],
        legend: false,
      },
    ],
    golden: { ...golden(["leaf"]), ...golden(["leaf"], "phi_PSII") },
  },
  {
    id: "fig2",
    title: "Figure 2: nutrient treatments",
    columns: 2,
    scans: {
      ...scans(linspace(15, 45, 301), SOYBEAN_N),
      ...scans(linspace(5, 35, 301), PINUS),
    },
    plots: [
      family(
        { n16: "16 mM", n5: "5 mM", n2: "2 mM" },
        {
          panel: "A",
          title: "Glycine max",
          xLim: [15, 45],
          yLim: [0, 275],
        },
      ),
      family(
        { hn: "100 % nutrient", ln: "33 % nutrient" },
        {
          panel: "B",
          title: "Pinus radiata",
          xLim: [5, 35],
          yLim: [0, 70],
        },
      ),
    ],
    golden: golden([...Object.keys(SOYBEAN_N), ...Object.keys(PINUS)]),
  },
  {
    id: "fig3",
    title: "Figure 3: growth temperature",
    columns: 2,
    scans: {
      ...Object.fromEntries(
        Object.entries(scans(linspace(15, 45, 301), SOYBEAN_T)).map(
          ([k, v]) => [`soy_${k}`, v],
        ),
      ),
      ...Object.fromEntries(
        Object.entries(scans(linspace(10, 40, 301), ABUTILON)).map(([k, v]) => [
          `abu_${k}`,
          v,
        ]),
      ),
    },
    plots: [
      family(
        { soy_g20: "20/15", soy_g25: "25/20", soy_g32: "32/27" },
        {
          panel: "A",
          title: "Glycine max",
          xLim: [15, 45],
          yLim: [0, 300],
        },
      ),
      family(
        { abu_g16: "16", abu_g20: "20", abu_g28: "28", abu_g32: "32" },
        {
          panel: "B",
          title: "Abutilon theophrasti",
          xLim: [10, 40],
          yLim: [0, 300],
        },
      ),
    ],
    golden: golden([
      ...Object.keys(SOYBEAN_T).map((k) => `soy_${k}`),
      ...Object.keys(ABUTILON).map((k) => `abu_${k}`),
    ]),
  },
  {
    id: "fig4",
    title: "Figure 4: Ω against To",
    scans: {
      reg: {
        over: { To: linspace(15, 60, 451) },
        columns: ["Omega_regression"],
        simulate: steadyState,
      },
    },
    data: {
      ...points("glycine", GLYCINE),
      ...points("herbs", HERBS),
      ...points("herbs_x", HERBS_EXTRAPOLATED),
      ...points("trees", TREES),
    },
    plots: [
      {
        type: "line",
        x: "reg.x",
        y: [
          {
            of: "reg.Omega_regression",
            label: "Ω = 11.6 + 0.18 To",
            color: "black",
          },
          pointSeries("glycine", "Glycine max", "^"),
          pointSeries("trees", "Trees", "o"),
          pointSeries("herbs", "Herbaceous", "s"),
          pointSeries("herbs_x", "To extrapolated", "s", "none"),
        ],
        xLabel: "To / °C",
        yLabel: "Ω / °C",
        xLim: [15, 60],
        yLim: [0, 40],
        legend: true,
      },
    ],
    golden: golden(["reg"], "Omega_regression"),
  },
  {
    id: "fig5",
    title: "Figure 5: normalised responses",
    scans: Object.fromEntries(
      Object.entries(NORMALISED).map(([k, fit]) => [
        k,
        scan(linspace(0, 50, 501), fit, ["J_rel25"]),
      ]),
    ),
    plots: [
      {
        type: "line",
        x: "t20w15.x",
        y: Object.entries(NORMALISED).map(([k, [, To, Omega]]): LineSeries => ({
          of: `${k}.J_rel25`,
          x: `${k}.x`,
          label: `To ${To}, Ω ${Omega}`,
          color: "black",
          dash: k === "t30w20" ? "dashed" : "solid",
        })),
        xLabel: T_LABEL,
        yLabel: "Relative rate",
        xLim: [0, 50],
        yLim: [0, 1.5],
        legend: true,
      },
    ],
    golden: golden(Object.keys(NORMALISED), "J_rel25"),
  },
];
