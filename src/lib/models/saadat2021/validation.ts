import { linspace, repeat, step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LineSeries,
  Mca,
  Validation,
} from "#lib/validation/types.js";

const PULSE = 5000;
const period = (light: number) => [
  step(119.2, { PPFD: light }),
  step(0.8, { PPFD: PULSE }),
];

const ppfd = linspace(50, 1500, 100);
const fig3Columns = [
  "PSI",
  "PSII",
  "cyclic_electron_flow",
  "mehler",
  "PTOX",
  "ATP_per_tot",
  "NADPH_per_tot",
  "Fd_ox_per_tot",
  "PQ_ox_per_tot",
  "PC_ox_per_tot",
  "H2O2",
];

const log2Fold = [...linspace(-3, -1.75, 100), ...linspace(-1.1, 3, 100)];
const fig4Columns = [
  "PSI",
  "PSII",
  "cyclic_electron_flow",
  "H2O2",
  "ATP_per_tot",
  "NADPH_per_tot",
  "Fd_ox_per_tot",
];
// Plotted, but without goldens.
const fig4Extra = ["PQ_ox_per_tot", "PC_ox_per_tot"];

const GREY = "#b3b3b3";
const PPFD_LABEL = "PPFD / (µmol m⁻² s⁻¹)";

const light = [...repeat([step(60, { PPFD: 600 }), step(60, { PPFD: 40 })], 5)];
const FIG5_DARK = [0, 1, 2, 3, 4].map((k) => ({
  from: 120 * k + 60,
  to: 120 * k + 120,
  color: GREY,
}));

const CONTROL_PARAMS = [
  "PSII_total",
  "PSI_total",
  "kcat_b6f",
  "kf_cyclic_electron_flow",
  "kMehler",
  "kcat_rubisco_carboxylase",
  "kcat_fbpase",
  "kcat_SBPase",
  "kcat_mda_reductase_2",
  "kcat_dehydroascorbate_reductase",
];
const CONTROL_LABELS = [
  "PS2",
  "PS1",
  "b6f",
  "PGR5",
  "Mehler",
  "RuBisCO",
  "FBPase",
  "SBPase",
  "MDAR",
  "DHAR",
];
const CONTROL_VARIABLES = [
  "Plastoquinone_reduced",
  "Ferredoxine_reduced",
  "Plastocyanine_reduced",
  "NADPH",
  "ATP",
  "RUBP",
  "_3PGA",
  "FBP",
  "SBP",
];
const CONTROL_FLUXES = [
  "PSII",
  "PSI",
  "b6f",
  "mehler",
  "cyclic_electron_flow",
  "rubisco_carboxylase",
  "fbpase",
  "SBPase",
  "mda_reductase_2",
  "dehydroascorbate_reductase",
];
const CONTROL_ROWS = [...CONTROL_VARIABLES, ...CONTROL_FLUXES];
const DISPLACEMENT = 0.01;
const LIGHTS = [100, 1000];

/** MxlPy's normalised response coefficients at each light. */
const mcaAt = (pfd: number): Mca => ({
  type: "responseCoefficients",
  set: { PPFD: pfd },
  wrt: CONTROL_PARAMS,
  outputs: CONTROL_ROWS,
  displacement: DISPLACEMENT,
});

const FLUX_LABELS = [
  "PS2",
  "PS1",
  "b₆f",
  "Mehler",
  "CEF",
  "RuBisCO",
  "FBPase",
  "SBPase",
  "MDAR",
  "DHAR",
];
const VARIABLE_LABELS = [
  "PQred",
  "Fdred",
  "PCred",
  "NADPH",
  "ATP",
  "RUBP",
  "PGA",
  "FBP",
  "SBP",
];

/** MxlPy's plot.heatmap: red-blue around zero, one row per output. */
const heatmap = (
  pfd: number,
  title: string,
  rows: string[],
  labels: string[],
) => ({
  type: "heatmap" as const,
  title: `${title} · PPFD = ${pfd} µmol m⁻² s⁻¹`,
  colormap: "RdBu_r" as const,
  rows: labels,
  columns: CONTROL_LABELS.map((l) => (l === "b6f" ? "b₆f" : l)),
  z: rows.map((row) =>
    CONTROL_PARAMS.map((_, c) => `nth(mca${pfd}.${row}, ${c})`),
  ),
});

const mcaGolden: Record<string, GoldenSeries> = {};
for (const pfd of LIGHTS) {
  for (const row of CONTROL_ROWS) {
    mcaGolden[`${row}_${pfd}`] = { x: `mca${pfd}.x`, y: `mca${pfd}.${row}` };
  }
}

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: PAM protocol without cyclic electron flow",
    simulate: {
      kind: "protocol",
      steps: [
        ...repeat(period(40), 2),
        ...repeat(period(1000), 10),
        ...repeat(period(40), 9),
      ],
    },
    scenarios: { ko: { parameters: { kf_cyclic_electron_flow: 0 } } },
    ops: [
      {
        op: "pamNpq",
        as: "NPQ",
        fluo: "Fluo",
        pulse: { PPFD: PULSE },
        window: "between",
      },
    ],
    plots: [
      {
        type: "line",
        x: "ko.time",
        y: [
          {
            of: "ko.Fluo / max(ko.Fluo)",
            label: "Fluorescence",
            color: "red",
            lineWidth: 2.5,
          },
          {
            of: "ko.NPQ",
            x: "ko.NPQ.time",
            label: "NPQ",
            color: "black",
            dash: "dashed" as const,
            lineWidth: 2,
          },
        ],
        xLabel: "Time/(s)",
        yLabel: "Fluorescence (normalised)",
        xLim: [0, 2500],
        yLim: [0, 1.1],
        // The dark phases, pulses included, as the notebook shades them.
        phases: [
          { from: 0, to: 2 * 120 - 0.8, color: GREY },
          { from: 12 * 120 - 0.8, to: 21 * 120, color: GREY },
        ],
        legend: true,
      },
    ],
    golden: {
      Fluo: { x: "ko.time", y: "ko.Fluo" },
      NPQ: { x: "ko.NPQ.time", y: "ko.NPQ", byIndex: true },
    },
  },
  {
    id: "fig3",
    title: "Figure 3: light response at steady state",
    simulate: { kind: "steadyState" },
    scans: {
      scan: {
        over: { PPFD: ppfd },
        columns: fig3Columns,
        // MxlPy detects oscillations at some lights; the notebook drops those.
        allowFailure: true,
      },
    },
    columns: 2,
    plots: [
      {
        type: "line",
        panel: "A",
        title: "Photosynthetic Electron Fluxes",
        x: "scan.x",
        y: [
          { of: "scan.PSI", label: "PSI", color: "#1a75b5" },
          { of: "scan.PSII * 2", label: "LEF", color: "#fc7f09" },
          { of: "scan.cyclic_electron_flow", label: "CEF", color: "#269b2a" },
          {
            of: "scan.mehler",
            label: "Mehler",
            color: "#fa0002",
            dash: "dashed" as const,
            axis: "right",
          },
          {
            of: "scan.PTOX",
            label: "PTOX",
            color: "#fa0002",
            dash: "dotted" as const,
            axis: "right",
          },
        ].map((line): LineSeries => ({ ...line, lineWidth: 2 })),
        xLabel: PPFD_LABEL,
        yLabel: "mmol e⁻ / mol Chl / s",
        yRightLabel: "mmol e⁻ / mol Chl / s",
        yRightColor: "red",
        legend: true,
      },
      {
        type: "line",
        panel: "B",
        title: "Energy and Redox Status",
        x: "scan.x",
        y: [
          { of: "scan.ATP_per_tot", label: "ATP", color: "#1270b1" },
          { of: "scan.NADPH_per_tot", label: "NADPH", color: "#fa7d07" },
          { of: "scan.Fd_ox_per_tot", label: "Fdred", color: "#259e24" },
          { of: "scan.PQ_ox_per_tot", label: "PQred", color: "#9464c0" },
          { of: "scan.PC_ox_per_tot", label: "PCred", color: "#895149" },
          {
            of: "scan.H2O2",
            label: "H2O2",
            color: "#f80105",
            dash: "dashed" as const,
            axis: "right",
          },
        ].map((line): LineSeries => ({ ...line, lineWidth: 2 })),
        xLabel: PPFD_LABEL,
        yLabel: "Fraction of the pool",
        yRightLabel: "Concentration/mM",
        yRightColor: "red",
        legend: true,
      },
    ],
    golden: Object.fromEntries(
      fig3Columns.map((c) => [c, { x: "scan.x", y: `scan.${c}` }]),
    ),
  },
  {
    id: "fig4",
    title: "Figure 4: PGR5 activity at 1000 µmol",
    simulate: { kind: "steadyState" },
    scans: {
      scan: {
        over: { PPFD: [1000] },
        scale: { kf_cyclic_electron_flow: log2Fold.map((e) => 2 ** e) },
        x: log2Fold,
        columns: [...fig4Columns, ...fig4Extra],
        // The notebook drops the points that don't converge.
        allowFailure: true,
      },
    },
    columns: 1,
    plots: [
      {
        type: "line",
        panel: "A",
        title: "Photosynthetic Electron Fluxes",
        x: "scan.x",
        y: [
          { of: "scan.PSI", label: "PSI", color: "#1a75b5" },
          { of: "scan.PSII * 2", label: "LEF", color: "#fc7f09" },
          { of: "scan.cyclic_electron_flow", label: "CEF", color: "#269b2a" },
          { of: "scan.H2O2", label: "H2O2", color: "#fa0002", axis: "right" },
        ].map((line): LineSeries => ({ ...line, lineWidth: 2 })),
        yLabel: "mmol e⁻ / mol Chl / s",
        yRightLabel: "H₂O₂ / µM",
        yRightColor: "red",
        legend: true,
      },
      {
        type: "line",
        panel: "B",
        title: "Energy and Redox Status",
        x: "scan.x",
        y: [
          { of: "scan.ATP_per_tot", label: "ATP", color: "#1f77b4" },
          { of: "scan.NADPH_per_tot", label: "NADPH", color: "#ff7f0e" },
          { of: "scan.Fd_ox_per_tot", label: "Fdred", color: "#2da02d" },
          { of: "scan.PQ_ox_per_tot", label: "PQred", color: "#9467bd" },
          { of: "scan.PC_ox_per_tot", label: "PCred", color: "#8c564b" },
        ].map((line): LineSeries => ({ ...line, lineWidth: 2 })),
        xLabel: "log₂-fold change in PRG5 activity",
        yLabel: "Fraction of the pool",
        legend: true,
      },
    ],
    golden: Object.fromEntries(
      fig4Columns.map((c) => [c, { x: "scan.x", y: `scan.${c}` }]),
    ),
  },
  {
    id: "fig5",
    title: "Figure 5: fluctuating light",
    simulate: { kind: "protocol", steps: light },
    scenarios: {
      wt: {},
      ko: { parameters: { kf_cyclic_electron_flow: 0 } },
    },
    columns: 2,
    plots: [
      {
        type: "line",
        panel: "A",
        x: "wt.time",
        y: [
          {
            of: "ko.Fd_ox_per_tot",
            label: "PGR-5 KO",
            color: "red",
            lineWidth: 3,
          },
          {
            of: "wt.Fd_ox_per_tot",
            label: "wild type",
            color: "black",
            lineWidth: 3,
          },
        ],
        xLabel: "Time / (s)",
        yLabel: "Fd Redox State",
        phases: FIG5_DARK,
        // The notebook's figure-wide legend.
        legend: true,
        legendPosition: "bottom",
      },
      {
        type: "line",
        panel: "B",
        x: "wt.time",
        y: [
          { of: "wt.rubisco_carboxylase", color: "black", lineWidth: 3 },
          { of: "ko.rubisco_carboxylase", color: "red", lineWidth: 3 },
        ],
        xLabel: "Time / (s)",
        yLabel: "Rate of RuBisCO / (mM / s)",
        phases: FIG5_DARK,
      },
    ],
    golden: {
      Fd_wt: { x: "wt.time", y: "wt.Fd_ox_per_tot" },
      Fd_ko: { x: "ko.time", y: "ko.Fd_ox_per_tot" },
      rubisco_wt: { x: "wt.time", y: "wt.rubisco_carboxylase" },
      rubisco_ko: { x: "ko.time", y: "ko.rubisco_carboxylase" },
    },
  },
  {
    id: "fig6",
    title: "Figure 6: control coefficients",
    // Differences of nearly equal steady states need more precise solves.
    rtol: 1e-10,
    atol: 1e-12,
    // At those, MxlPy's oscillation detector misfires at PPFD 1000.
    exportTolerances: { rtol: 1e-8, atol: 1e-8 },
    simulate: { kind: "steadyState" },
    mca: Object.fromEntries(LIGHTS.map((l) => [`mca${l}`, mcaAt(l)])),
    columns: 2,
    plots: [1000, 100].flatMap((l) => [
      heatmap(l, "Flux Control Coefficient", CONTROL_FLUXES, FLUX_LABELS),
      heatmap(
        l,
        "Concentration Control Coefficient",
        CONTROL_VARIABLES,
        VARIABLE_LABELS,
      ),
    ]),
    golden: mcaGolden,
  },
];
