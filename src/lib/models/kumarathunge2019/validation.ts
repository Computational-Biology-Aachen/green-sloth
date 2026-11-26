import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Fig 7: the optimum temperature of Anet at Ci = 275 µmol mol⁻¹, predicted per
 * mature-plant dataset, against the observed one. Figs 1–6 are data with
 * regression lines (see curatornotes.md).
 *
 * The per-dataset inputs aren't printed. They come from the authors' analysis
 * repository (bitbucket.org/Kumarathunge/photom, Tables/), as does the
 * procedure: Photosyn (plantecophys) at leaf temperatures 15, 16, …, 35 °C,
 * and Topt is the leaf temperature of the largest Anet.
 */
const steadyState = { kind: "steadyState" } as const;

type Site = [
  label: string,
  pft: string,
  T_growth: number,
  T_home: number,
  Vcmax25: number,
  observed: number,
  se: number,
  RL25: number,
];

// Fig 7's mature plants: T_growth (30-day mean air temperature), T_home, the
// PFT mean Vcmax25 (Table 2, unrounded; the savanna uses EA-Tr's), the
// observed ToptA275 ± SE and the fitted |RL25| (Fig 7b only). Order and names
// as the figure's legend.
const SITES: Site[] = [
  ["Mongolian Oak, Japan", "DA-Te", 12.9, 23.8, 39.043, 21.312, 1.335, 1.2525],
  [
    "Eucalyptus Woodland, AU-NSW",
    "EA-Te",
    17.1333,
    28.9,
    82.9746,
    27.603,
    1.195,
    1.1486,
  ],
  [
    "Semi-arid Woodland, AU-WA",
    "EA-Te",
    21.9957,
    34.5,
    82.9746,
    26.041,
    5.21,
    1.3022,
  ],
  [
    "Savanna Eucalyptus, AU-NT",
    "EA-Te",
    27.1315,
    37.8,
    39.4524,
    31.904,
    0.334,
    0.4167,
  ],
  [
    "Subalpine Eucalyptus, AU-NSW",
    "EA-Te",
    11.78,
    22.9,
    82.9746,
    26.114,
    4.386,
    2.2464,
  ],
  [
    "Black Spruce, USA-MN",
    "EG-Br",
    5.3383,
    25.8,
    80.4005,
    19.849,
    0.699,
    2.0207,
  ],
  [
    "Norway Spruce, Sweden",
    "EG-Br",
    9.3778,
    20.1,
    80.4005,
    22.15,
    1.269,
    1.1269,
  ],
  ["Scots pine, Sweden", "EG-Br", 15.4, 20.1, 80.4005, 24.443, 0.447, 2.2342],
  ["Scots pine, Finland", "EG-Br", 14.0, 20.4, 80.4005, 17.506, 0.214, 3.5223],
  [
    "Loblolly Pine, USA-NC",
    "EG-Te",
    26.4036,
    31.4,
    42.8136,
    27.851,
    2.961,
    0.547,
  ],
  ["Red Pine, Japan", "EG-Te", 11.85, 26.0, 42.8136, 22.718, 0.791, 1.0248],
  [
    "Maritime Pine, France",
    "EG-Te",
    20.9629,
    26.7,
    42.8136,
    28.877,
    1.05,
    0.2941,
  ],
  [
    "Rainforest, Puerto Rico",
    "EA-Tr",
    24.0083,
    29.8,
    39.4524,
    31.801,
    2.234,
    0.826,
  ],
  [
    "Rainforest understorey, Puerto Rico",
    "EA-Tr",
    24.0083,
    29.8,
    39.4524,
    32.246,
    1.648,
    2.2134,
  ],
  ["Rainforest, Panama", "EA-Tr", 26.9, 32.6, 39.4524, 33.469, 0.493, 0.5585],
  ["Rainforest, Brazil", "EA-Tr", 25.8, 32.7, 39.4524, 31.512, 2.803, 0.5762],
  [
    "Rainforest, AU-QLD",
    "EA-Tr",
    27.5283,
    31.3,
    39.4524,
    32.281,
    1.629,
    0.6146,
  ],
  ["Arctic tundra, USA-AK", "Arctic", 3.1, 7.7, 78.3006, 20.917, 2.929, 2.5537],
];

// The figure's colours per PFT (R's Set1/Set3), and markers in legend order
const COLOR: Record<string, string> = {
  "DA-Te": "#E41A1C",
  "EA-Te": "#377EB8",
  "EG-Br": "#4DAF4A",
  "EG-Te": "#984EA3",
  "EA-Tr": "#FF7F00",
  Arctic: "#8DD3C7",
};
const MARKERS = ["o", "s", "D", "^", "v"] as const;

// Photosyn's leaf temperatures; Topt therefore lands on whole degrees
const T_LEAF = linspace(15, 35, 21);

/**
 * Fig 7a: Table 2 as the authors' code evaluates it, with the coefficients
 * unrounded (Table 2 prints them to 2–4 significant figures) and Photosyn's
 * hyperbolic minimum of Ac and Aj. With Table 2's rounded values and Eqn 2's
 * plain minimum, three datasets move by 1 °C (curatornotes.md).
 */
const THIS_STUDY = {
  JVr_a: 2.55684,
  JVr_b: 0.03707,
  JVr_c: 0.02019,
  dSJ_a: 658.7761,
  dSJ_b: 0.8431,
  dSJ_c: 0.5194,
  EaJ: 40.71109,
};

/**
 * Fig 7b: the Kattge & Knorr (2007) functions in Table 2's form, as the
 * authors' code sets them: EaV 72, EaJ 50 kJ mol⁻¹, ΔSV = 668.39 − 1.07
 * T_growth, ΔSJ = 659.7 − 0.75 T_growth, JVr = 2.59 − 0.035 T_growth (equal
 * T_home and deviation slopes cancel T_home), and RL25 the fitted value per
 * dataset.
 */
const KATTGE_KNORR = {
  EaV_a: 72,
  EaV_b: 0,
  dSV_a: 668.39,
  dSV_b: 1.07,
  EaJ: 50,
  JVr_a: 2.59,
  JVr_b: 0.035,
  JVr_c: 0.035,
  dSJ_a: 659.7,
  dSJ_b: 0.75,
  dSJ_c: 0.75,
  rV_b: 0,
};

function scans(
  prefix: string,
  set: Record<string, number>,
  perSite: (s: Site) => Record<string, number> = () => ({}),
): Record<string, Scan> {
  return Object.fromEntries(
    SITES.map((s, i): [string, Scan] => {
      const over: Record<string, number[]> = { T_leaf: T_LEAF };
      const fixed = {
        T_growth: s[2],
        T_home: s[3],
        Vcmax25: s[4],
        ...set,
        ...perSite(s),
      };
      for (const [k, v] of Object.entries(fixed)) over[k] = [v];
      return [
        `${prefix}${i}`,
        { over, columns: ["A_net_h"], simulate: steadyState },
      ];
    }),
  );
}

/** Topt per dataset: the leaf temperature of the largest Anet, by `at`. */
function toptTable(prefix: string) {
  return {
    x: SITES.map((_, i) => i),
    columns: {
      pred: SITES.map(
        (_, i) =>
          `at(${prefix}${i}.x, max(${prefix}${i}.A_net_h), ${prefix}${i}.A_net_h)`,
      ),
    },
  };
}

const DATA = {
  obs: SITES.map((s) => s[5]),
  se: SITES.map((s) => s[6]),
  identity: [14, 36],
};

function figure(
  id: string,
  title: string,
  prefix: string,
  fit: [slope: number, intercept: number, from: number, to: number],
  set: Record<string, number>,
  perSite?: (s: Site) => Record<string, number>,
): Validation {
  const table = `topt_${prefix}`;
  const seen: Record<string, number> = {};
  const points = SITES.map((s, i): LineSeries => {
    const k = seen[s[1]] ?? 0;
    seen[s[1]] = k + 1;
    const one = (col: string) => `slice(${col}, ${i}, ${i + 1})`;
    return {
      of: one("data.obs"),
      x: one(`${table}.pred`),
      err: one("data.se"),
      style: "markers",
      marker: MARKERS[k],
      markerSize: 7,
      color: COLOR[s[1]],
      capSize: 2,
      label: s[0],
    };
  });
  const [slope, intercept, from, to] = fit;
  return {
    id,
    title,
    scans: scans(prefix, set, perSite),
    collect: { [table]: toptTable(prefix) },
    data: {
      ...DATA,
      fitX: [from, to],
      fitY: [from, to].map((x) => slope * x + intercept),
    },
    plots: [
      {
        type: "line",
        x: `${table}.pred`,
        y: [
          {
            of: "data.identity",
            x: "data.identity",
            color: "black",
            lineWidth: 1,
          },
          {
            of: "data.fitY",
            x: "data.fitX",
            color: "black",
            lineWidth: 3,
            label: `paper's fit, y = ${slope} x ${intercept < 0 ? "−" : "+"} ${Math.abs(intercept)}`,
          },
          ...points,
        ],
        xLabel: "ToptA275, predicted / °C",
        yLabel: "ToptA275 / °C",
        xLim: [14, 36],
        yLim: [14, 36],
        xTicks: [15, 20, 25, 30, 35],
        yTicks: [15, 20, 25, 30, 35],
        legend: true,
        legendPosition: "right",
      },
    ],
    // Evaluated without a solver: the TS engine and the exported notebook
    // agree to rounding
    golden: {
      [`pred_${prefix}`]: {
        x: `${table}.x`,
        y: `${table}.pred`,
        tolerance: 1e-9,
      } satisfies GoldenSeries,
    },
  };
}

export const validations: Validation[] = [
  figure(
    "fig7a",
    "Figure 7a: predicted against observed ToptA275, acclimation and adaptation (Table 2)",
    "a",
    // The caption's least-squares line, drawn over the predicted range
    [1.09, -2.2, 17.5, 33],
    THIS_STUDY,
  ),
  figure(
    "fig7b",
    "Figure 7b: predicted against observed ToptA275, Kattge & Knorr (2007)",
    "b",
    [1.58, -13.82, 20, 30.5],
    KATTGE_KNORR,
    (s) => ({ rV_a: s[7] / s[4] }),
  ),
];
