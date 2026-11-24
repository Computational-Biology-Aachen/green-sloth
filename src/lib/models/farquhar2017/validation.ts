import { linspace } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LineSeries,
  Scan,
  Validation,
} from "#lib/validation/types.js";

/**
 * Figs 2–7, the paper's model figures. Fig 1 shows measurements. Panels made of
 * two-line least-squares fits to the modelled A–I curves (Figs 3b,c, 4b,c,
 * 6b–d) and the fitted transition points drawn as black circles are left out:
 * they are a regression over a scan, not model outputs. See curatornotes.md.
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

function curve(of: string, style: Partial<LineSeries> = {}): LineSeries {
  return { of, x: `${of.split(".")[0]}.x`, color: "black", ...style };
}

const GREY = "#808080";
const A_LABEL = "A / µmol m⁻² s⁻¹";
const I_LABEL = "PPFD / µmol photons m⁻² s⁻¹";
const I_RANGE = linspace(0, 100, 201);

/** A–I curves, one per value of `param`, grey with the value as end label. */
function family(
  param: string,
  values: number[],
  column: string,
  set: Over = {},
) {
  const scans = Object.fromEntries(
    values.map((v) => [
      `${param}${v}`,
      scan("I", I_RANGE, { ...set, [param]: v }, [column]),
    ]),
  );
  const series = values.map((v) =>
    curve(`${param}${v}.${column}`, {
      color: GREY,
      lineWidth: 1,
      endLabel: `${v}`,
    }),
  );
  return { scans, series };
}

// Fig 2c: the linear fits below and above Ic that the text prints (Results)
const FIG2_FITS = { x: [0, 100] };

const FIG3_O = [10, 50, 100, 210, 300, 400];
const FIG4_CA = [50, 100, 200, 400, 800, 1600];
const FIG5_O = [10, 50, 100, 210, 400];
const FIG5_DASH: LineSeries["dash"][] = [
  "dotted",
  "dashdot",
  [1, 2],
  "solid",
  "dashed",
];
const FIG6_T = [15, 20, 25, 30, 35, 40];

// Fig 7: Ci/P held constant (a) and the irradiances of its points (b)
const FIG7_CI = [37, 40.2, 43, 46];
const FIG7_CI_COLOR = ["#d62728", "white", "#1f77b4", "#2ca02c"];
const FIG7_I = [75, 125, 200, 300, 400];

/** Fig 7's points at one Ci, coloured as in the paper. */
const ciPoints = (i: number): LineSeries =>
  curve(`pts_ci${i}.A_i`, {
    style: "markers",
    marker: "o",
    markerFace: FIG7_CI_COLOR[i],
    markerEdge: "black",
    color: FIG7_CI_COLOR[i],
  });

const fig3 = family("O", FIG3_O, "A");
const fig4 = family("Ca", FIG4_CA, "A");
const fig5 = {
  cc: family("O", FIG5_O, "Cc", { Ca: 0 }),
  a: family("O", FIG5_O, "A", { Ca: 0 }),
};
const fig6 = family("T_leaf", FIG6_T, "A");

const zero = { value: 0, color: "black", lineWidth: 0.8 };
const rdLine = {
  value: -1,
  color: "black",
  dash: "dashed" as const,
  lineWidth: 1,
};

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: conductances, Cc and A against irradiance",
    columns: 1,
    scans: { i: scan("I", I_RANGE, {}, ["gt", "gsw", "gm", "Cc", "A"]) },
    data: FIG2_FITS,
    plots: [
      {
        type: "line",
        panel: "a",
        x: "i.x",
        y: [
          curve("i.gt", { color: GREY, label: "gt" }),
          curve("i.gsw", { color: "blue", dash: "dotted", label: "gsw" }),
          curve("i.gm", { color: "#c00000", dash: "dashed", label: "gm" }),
        ],
        xLabel: I_LABEL,
        yLabel: "g / mol m⁻² s⁻¹",
        xLim: [0, 100],
        yLim: [0, 0.055],
        legend: true,
      },
      {
        type: "line",
        panel: "b",
        x: "i.x",
        y: [curve("i.Cc", { color: "#8b0000", label: "Cc" })],
        xLabel: I_LABEL,
        yLabel: "Cc / µmol mol⁻¹",
        xLim: [0, 100],
        yLim: [0, 1300],
        hLines: [
          { value: 400, color: "black", dash: "dashed", lineWidth: 1 },
          { value: 200, color: "black", dash: "dashdot", lineWidth: 1 },
        ],
        legend: true,
        annotations: [
          { text: "Ca", x: 92, y: 430, size: 9 },
          { text: "0.5 Ca", x: 5, y: 230, size: 9 },
        ],
      },
      {
        type: "line",
        panel: "c",
        x: "i.x",
        y: [
          curve("i.A", { label: "A" }),
          {
            of: "0.0654 * data.x - 0.9688",
            x: "data.x",
            color: "blue",
            dash: "dashed",
            lineWidth: 1,
            label: "Linear fit of A below Ic",
          },
          {
            of: "0.0467 * data.x - 0.6383",
            x: "data.x",
            color: "#c00000",
            dash: "dashed",
            lineWidth: 1,
            label: "Linear fit of A above Ic",
          },
        ],
        xLabel: I_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 100],
        yLim: [-1.5, 5.5],
        hLines: [zero],
        legend: true,
      },
    ],
    golden: golden({ i: ["gt", "gsw", "gm", "Cc", "A"] }),
  },
  {
    id: "fig3a",
    title: "Figure 3(a): A–I at O₂ from 10 to 400 mmol mol⁻¹",
    scans: fig3.scans,
    plots: [
      {
        type: "line",
        x: `O${FIG3_O[0]}.x`,
        y: fig3.series,
        xLabel: I_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 100],
        yLim: [-1.2, 6],
        hLines: [zero],
      },
    ],
    golden: golden(Object.fromEntries(FIG3_O.map((o) => [`O${o}`, ["A"]]))),
  },
  {
    id: "fig4a",
    title: "Figure 4(a): A–I at Ca from 50 to 1600 µmol mol⁻¹",
    scans: fig4.scans,
    plots: [
      {
        type: "line",
        x: `Ca${FIG4_CA[0]}.x`,
        y: fig4.series,
        xLabel: I_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 100],
        yLim: [-1.2, 6],
        hLines: [zero],
      },
    ],
    golden: golden(Object.fromEntries(FIG4_CA.map((c) => [`Ca${c}`, ["A"]]))),
  },
  {
    id: "fig5",
    title: "Figure 5: CO₂ efflux into CO₂-free air",
    columns: 1,
    scans: {
      ...Object.fromEntries(
        Object.entries(fig5.cc.scans).map(([k, s]) => [`cc_${k}`, s]),
      ),
      ...Object.fromEntries(
        Object.entries(fig5.a.scans).map(([k, s]) => [`a_${k}`, s]),
      ),
    },
    plots: [
      {
        type: "line",
        panel: "a",
        x: `cc_O${FIG5_O[0]}.x`,
        y: FIG5_O.map((o, i) =>
          curve(`cc_O${o}.Cc`, {
            dash: FIG5_DASH[i],
            lineWidth: 1,
            label: `${o}`,
          }),
        ),
        xLabel: I_LABEL,
        yLabel: "Cc / µmol mol⁻¹",
        xLim: [0, 100],
        yLim: [0, 1050],
        legend: true,
      },
      {
        type: "line",
        panel: "b",
        x: `a_O${FIG5_O[0]}.x`,
        y: FIG5_O.map((o) =>
          curve(`a_O${o}.A`, { color: GREY, lineWidth: 1, endLabel: `${o}` }),
        ),
        xLabel: I_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 100],
        yLim: [-1.5, 0.1],
      },
    ],
    golden: golden(
      Object.fromEntries(
        FIG5_O.flatMap((o) => [
          [`cc_O${o}`, ["Cc"]],
          [`a_O${o}`, ["A"]],
        ]),
      ),
    ),
  },
  {
    id: "fig6a",
    title: "Figure 6(a): A–I at leaf temperatures from 15 to 40 °C",
    scans: fig6.scans,
    plots: [
      {
        type: "line",
        x: `T_leaf${FIG6_T[0]}.x`,
        y: FIG6_T.map((t) =>
          curve(`T_leaf${t}.A`, {
            color: GREY,
            lineWidth: 1,
            endLabel: `${t} °C`,
          }),
        ),
        xLabel: I_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 100],
        yLim: [-3, 6],
        hLines: [zero],
      },
    ],
    golden: golden(
      Object.fromEntries(FIG6_T.map((t) => [`T_leaf${t}`, ["A"]])),
    ),
  },
  {
    id: "fig7",
    title: "Figure 7: the Laisk approach, A at constant Ci",
    scans: {
      ...Object.fromEntries(
        FIG7_CI.map((c, i) => [
          `ci${i}`,
          scan("I", linspace(0, 400, 401), { Ci: c }, ["A_i"]),
        ]),
      ),
      ...Object.fromEntries(
        FIG7_CI.map((c, i) => [
          `pts_ci${i}`,
          scan("I", FIG7_I, { Ci: c }, ["A_i"]),
        ]),
      ),
      ...Object.fromEntries(
        FIG7_I.map((I) => [
          `i${I}`,
          scan("Ci", linspace(36, 48, 121), { I }, ["A_i"]),
        ]),
      ),
    },
    plots: [
      {
        type: "line",
        panel: "a",
        x: "ci0.x",
        y: [
          ...FIG7_CI.map((c, i) =>
            curve(`ci${i}.A_i`, {
              color: GREY,
              lineWidth: 1,
              endLabel: `${c}`,
            }),
          ),
          ...FIG7_CI.map((_, i) => ciPoints(i)),
        ],
        xLabel: I_LABEL,
        yLabel: A_LABEL,
        xLim: [0, 420],
        yLim: [-1.2, 0.45],
        hLines: [zero, rdLine],
      },
      {
        type: "line",
        panel: "b",
        x: `i${FIG7_I[0]}.x`,
        y: [
          ...FIG7_I.map((I) =>
            curve(`i${I}.A_i`, { color: GREY, lineWidth: 1, endLabel: `${I}` }),
          ),
          // Fig 7a's points, with Ci on the x axis
          ...FIG7_CI.map((c, i) => ({
            ...ciPoints(i),
            x: `pts_ci${i}.x * 0 + ${c}`,
          })),
        ],
        xLabel: "Ci / µmol mol⁻¹",
        yLabel: A_LABEL,
        xLim: [35.5, 48.5],
        yLim: [-1.2, 0.45],
        hLines: [zero, rdLine],
      },
    ],
    golden: golden({
      ...Object.fromEntries(FIG7_CI.map((_, i) => [`ci${i}`, ["A_i"]])),
      ...Object.fromEntries(FIG7_I.map((I) => [`i${I}`, ["A_i"]])),
    }),
  },
];
