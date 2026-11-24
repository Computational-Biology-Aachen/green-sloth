import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LineSeries,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 2–4: the per-growth-temperature fits of Tables 1 and 2. Fig 1 and Fig
 * 4a are data with unprinted regressions, Figs 5 and 6 need the unprinted
 * lemon and poplar measurements (see curatornotes.md).
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
// The 14 °C fits are drawn over 10–30 °C only, as in Figs 2 and 3
const T14 = linspace(10, 30, 201);
const T_ALL = linspace(10, 40, 301);

// Growth temperatures: line style and marker as the paper's Figs 3 and 4
const GROWTH = {
  14: { dash: "dotted", marker: "v" },
  25: { dash: "solid", marker: "o" },
  35: { dash: "dashed", marker: "^" },
} as const;

// Fig 2: Jmax,f at 25 °C per growth temperature, the scale that fits Table 1's
// normalised function to the drawn line (curatornotes.md)
const J25 = { 14: 202.0, 25: 136.2, 35: 173.8 };

// Fig 2: the measured means, read off the figure (±5 µmol m⁻² s⁻¹)
const FIG2_DATA = {
  T14: [10, 15, 20, 25, 30, 40],
  J14: [80, 114, 165, 223, 261, 245],
  T: [10, 15, 20, 25, 30, 35, 37.5, 40],
  J25: [47, 61, 109, 128, 215, 251, 280, 312],
  J35: [75, 99, 134, 172, 225, 266, 301, 307],
};

// Fig 3: the 14 and 35 °C curves as drawn, digitised at 400 dpi (±0.01); they
// do not follow Table 1's rows (curatornotes.md)
const FIG3_DRAWN = {
  T14: [10.5, 15, 17.5, 30],
  J14: [0.426, 0.561, 0.649, 1.301],
  T35: [10.5, 12.5, 15, 17.5, 20, 27.5, 30, 32.5, 35, 37.5, 39.7],
  J35: [
    0.462, 0.514, 0.589, 0.671, 0.767, 1.102, 1.244, 1.402, 1.586, 1.798, 1.952,
  ],
};

function drawn(x: string, y: string, label?: string): LineSeries {
  return {
    of: `data.${y}`,
    x: `data.${x}`,
    style: "markers",
    marker: "x",
    color: "grey",
    label,
  };
}

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: Jmax,f against leaf temperature per growth temperature",
    scans: {
      g14: {
        over: { T_leaf: T14 },
        columns: ["Jf14"],
        simulate: steadyState,
      },
      t: {
        over: { T_leaf: T_ALL },
        columns: ["Jf25", "Jf35"],
        simulate: steadyState,
      },
    },
    data: FIG2_DATA,
    plots: [
      {
        type: "line",
        x: "t.x",
        y: [
          ...([14, 25, 35] as const).map((g): LineSeries => ({
            of: `${g === 14 ? "g14" : "t"}.Jf${g} * ${J25[g]}`,
            x: g === 14 ? "g14.x" : "t.x",
            color: "black",
          })),
          ...([14, 25, 35] as const).map((g): LineSeries => ({
            of: `data.J${g}`,
            x: g === 14 ? "data.T14" : "data.T",
            style: "markers",
            marker: GROWTH[g].marker,
            color: "black",
            label: `${g} °C grown`,
          })),
        ],
        xLabel: T_LABEL,
        yLabel: "Jmax,f / µmol m⁻² s⁻¹",
        xLim: [5, 45],
        yLim: [0, 350],
        legend: true,
      },
    ],
    golden: { ...golden("g14", ["Jf14"]), ...golden("t", ["Jf25", "Jf35"]) },
  },
  {
    id: "fig3",
    title: "Figure 3: Jmax,f normalised to unity at 25 °C (Table 1)",
    scans: {
      g14: {
        over: { T_leaf: T14 },
        columns: ["Jf14"],
        simulate: steadyState,
      },
      t: {
        over: { T_leaf: T_ALL },
        columns: ["Jf25", "Jf35"],
        simulate: steadyState,
      },
    },
    data: FIG3_DRAWN,
    plots: [
      {
        type: "line",
        x: "t.x",
        y: [
          ...([14, 25, 35] as const).map((g): LineSeries => ({
            of: `${g === 14 ? "g14" : "t"}.Jf${g}`,
            x: g === 14 ? "g14.x" : "t.x",
            color: "black",
            dash: GROWTH[g].dash,
            label: `${g} °C`,
          })),
          drawn("T14", "J14", "as drawn"),
          drawn("T35", "J35"),
        ],
        xLabel: T_LABEL,
        yLabel: "Normalised Jmax,f",
        xLim: [5, 45],
        yLim: [0, 2.5],
        legend: true,
      },
    ],
    golden: { ...golden("g14", ["Jf14"]), ...golden("t", ["Jf25", "Jf35"]) },
  },
  {
    id: "fig4",
    title:
      "Figure 4b,c: ΦPSII,max,l and ΘPSII against leaf temperature (Table 2)",
    columns: 1,
    scans: {
      t: {
        over: { T_leaf: T_ALL },
        columns: ["Phi", "Theta14", "Theta", "Theta35"],
        simulate: steadyState,
      },
    },
    plots: [
      {
        type: "line",
        panel: "b",
        x: "t.x",
        y: [{ of: "t.Phi", color: "black" }],
        yLabel: "ΦPSII,max,l",
        xLim: [5, 45],
        yLim: [0.3, 1.0],
        legend: false,
      },
      {
        type: "line",
        panel: "c",
        x: "t.x",
        y: (
          [
            [14, "Theta14"],
            [25, "Theta"],
            [35, "Theta35"],
          ] as const
        ).map(([g, col]) => ({
          of: `t.${col}`,
          color: "black",
          dash: GROWTH[g].dash,
          label: `${g} °C`,
        })),
        xLabel: T_LABEL,
        yLabel: "ΘPSII",
        xLim: [5, 45],
        yLim: [0, 1.1],
        legend: true,
      },
    ],
    golden: golden("t", ["Phi", "Theta14", "Theta", "Theta35"]),
  },
];
