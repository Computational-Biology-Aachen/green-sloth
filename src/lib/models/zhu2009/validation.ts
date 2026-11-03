import { defaultGrid, linspace } from "#lib/validation/helpers.js";
import type {
  Annotation,
  GoldenSeries,
  LinePlot,
  LineSeries,
  Plot,
  Validation,
} from "#lib/validation/types.js";

const COLUMNS = ["RuBP", "PGA", "DPGA", "Ru5P"];
const percent = [50, 100, 150, 200, 250, 300];

const MARKERS: Record<string, Pick<LineSeries, "marker" | "markerFace">> = {
  RuBP: { marker: "o" },
  PGA: { marker: "o", markerFace: "white" },
  DPGA: { marker: "v" },
  Ru5P: { marker: "v", markerFace: "white" },
};
const LETTERS = "ABCDEF";

interface Axis {
  lim: [number, number];
  ticks: number[];
  /** The notebook moves this panel's y axis to the right. */
  right?: boolean;
}

/** The y axis on the left or, for `right`, on the right. */
const yAxis = (a: Axis): Partial<LinePlot> =>
  a.right
    ? { yRightLim: a.lim, yRightTicks: a.ticks }
    : { yLim: a.lim, yTicks: a.ticks };
/** Lettered, named panel text in the top left, as the notebook writes it. */
const label = (i: number, name: string, y: number): Annotation[] => [
  { text: LETTERS[i], x: 0.05, y, coords: "axes", align: "left" },
  { text: name, x: 0.1, y, coords: "axes", align: "left" },
];

function scan(
  id: string,
  title: string,
  params: string[],
  axes: Axis[],
  layout: Partial<LinePlot> & { columns: number; bottom: number[] },
): Validation {
  const { columns, bottom, ...shared } = layout;
  const golden: Record<string, GoldenSeries> = {};
  for (const p of params) {
    for (const c of COLUMNS) {
      golden[`${p}_${c}`] = { x: `${p}.index`, y: `${p}.${c}` };
    }
  }
  return {
    id,
    title,
    columns,
    simulate: { kind: "steadyState" },
    scans: Object.fromEntries(
      params.map((p) => [
        p,
        {
          over: {},
          scale: { [p]: percent.map((pct) => pct / 100) },
          x: percent,
          columns: COLUMNS,
          // The notebook leaves out points that don't settle.
          allowFailure: true,
        },
      ]),
    ),
    plots: params.map((p, i): Plot => ({
      type: "line",
      x: `${p}.x`,
      y: COLUMNS.map((c) => ({
        of: `${p}.${c}`,
        label: c,
        style: "markers" as const,
        color: "black",
        ...MARKERS[c],
        ...(axes[i].right ? { axis: "right" } : {}),
      })),
      ...(bottom.includes(i)
        ? { xLabel: "Enzyme activity (Percentage of default %)" }
        : {}),
      ...(axes[i].right
        ? { yRightLabel: "Concentration (mM)" }
        : { yLabel: "Concentration (mM)" }),
      ...yAxis(axes[i]),
      annotations: label(i, p, 0.93),
      legend: i === 0,
      ...shared,
    })),
    golden,
  };
}

const FIG2: Record<string, Axis> = {
  RuBP: { lim: [0, 4], ticks: linspace(0, 4, 5) },
  PGA: { lim: [-1, 3], ticks: linspace(0, 3, 4), right: true },
  DPGA: { lim: [0, 3], ticks: linspace(0, 3, 4) },
  GAP: { lim: [0, 8], ticks: linspace(0, 8, 5), right: true },
  Ru5P: { lim: [0, 0.1], ticks: linspace(0, 0.09, 4) },
  // In the reference figure, but dropped from the notebook's code since it
  // keeps only variables; A is an assignment.
  A: { lim: [35, 60], ticks: linspace(35, 60, 6), right: true },
};

const sim = (tEnd: number) =>
  ({ kind: "timeCourse", tEval: defaultGrid(tEnd) }) as const;

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: RuBP clamped for 50 s",
    scenarios: {
      perturbed: {
        stages: [
          { simulate: sim(650) },
          {
            edits: [{ clampVariable: "RuBP", to: 0.5 }],
            simulate: sim(50),
          },
          { simulate: sim(300) },
        ],
      },
    },
    columns: 2,
    plots: Object.entries(FIG2).map(([c, axis], i): Plot => ({
      type: "line",
      x: "perturbed.time",
      y: [
        {
          of: `perturbed.${c}`,
          color: "black",
          ...(axis.right ? { axis: "right" } : {}),
        },
      ],
      ...(c === "Ru5P" || c === "A" ? { xLabel: "Time (s)" } : {}),
      ...(axis.right
        ? {
            yRightLabel:
              c === "A" ? "A (µmol m⁻² s⁻¹)" : "Metabolite Concentration (mM)",
          }
        : { yLabel: "Metabolite Concentration (mM)" }),
      xLim: [0, 1000],
      xTicks: linspace(0, 1000, 6),
      ...yAxis(axis),
      annotations: label(i, c, 0.9),
      legend: false,
    })),
    golden: Object.fromEntries(
      ["PGA", "DPGA", "GAP", "Ru5P"].map((c) => [
        c,
        { x: "perturbed.time", y: `perturbed.${c}` },
      ]),
    ),
  },
  scan(
    "fig3",
    "Figure 3: enzyme activities",
    ["V1_max", "V3_max", "V4_max", "V13_max"],
    [
      { lim: [0, 5.7], ticks: linspace(0, 5.6, 5) },
      { lim: [0, 1.2], ticks: linspace(0, 1.2, 5), right: true },
      { lim: [0, 8], ticks: linspace(0, 6, 4) },
      { lim: [0, 1], ticks: linspace(0, 0.9, 4), right: true },
    ],
    { columns: 2, bottom: [2, 3] },
  ),
  scan(
    "fig4",
    "Figure 4: enzyme activities",
    ["V2_max", "V5_max"],
    [
      { lim: [0, 1], ticks: linspace(0, 0.9, 4) },
      { lim: [0, 1], ticks: linspace(0, 0.9, 4), right: true },
    ],
    { columns: 2, bottom: [0, 1], xLim: [40, 360] },
  ),
];
