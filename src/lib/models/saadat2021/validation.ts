import {
  lastOf,
  linspace,
  repeat,
  step,
  sweep,
  sweepIds,
} from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  Scenario,
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

const light = [...repeat([step(60, { PPFD: 600 }), step(60, { PPFD: 40 })], 5)];

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

/** MxlPy's normalised response coefficients: central differences at steady state. */
const mcaScenarios = (pfd: number): Record<string, Scenario> => {
  const out: Record<string, Scenario> = {
    [`ref${pfd}`]: { parameters: { PPFD: pfd } },
  };
  CONTROL_PARAMS.forEach((p, i) => {
    out[`up${pfd}_${i}`] = {
      parameters: { PPFD: pfd, [p]: `param.${p} * ${1 + DISPLACEMENT}` },
    };
    out[`down${pfd}_${i}`] = {
      parameters: { PPFD: pfd, [p]: `param.${p} * ${1 - DISPLACEMENT}` },
    };
  });
  return out;
};

const mcaTable = (pfd: number) => ({
  x: CONTROL_PARAMS.map((_, i) => i),
  columns: Object.fromEntries(
    CONTROL_ROWS.map((row) => [
      row,
      CONTROL_PARAMS.map(
        (_, i) =>
          `(last(up${pfd}_${i}.${row}) - last(down${pfd}_${i}.${row})) / ${2 * DISPLACEMENT} / last(ref${pfd}.${row})`,
      ),
    ]),
  ),
});

const heatmap = (pfd: number, title: string, rows: string[]) => ({
  type: "heatmap" as const,
  title: `${title} at PPFD ${pfd}`,
  rows,
  columns: CONTROL_LABELS,
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
          { of: "ko.Fluo / max(ko.Fluo)", label: "Fluorescence" },
          { of: "ko.NPQ", x: "ko.NPQ.time", label: "NPQ" },
        ],
        xLabel: "Time (s)",
        yLabel: "Fluorescence (normalised)",
        xLim: [0, 2500],
        yLim: [0, 1.1],
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
    scenarios: sweep("p", ppfd, (value) => ({ parameters: { PPFD: value } })),
    collect: { scan: lastOf(sweepIds("p", 100), ppfd, fig3Columns) },
    plots: [
      {
        type: "line",
        title: "Photosynthetic electron fluxes",
        x: "scan.x",
        y: [
          { of: "scan.PSI", label: "PSI" },
          { of: "scan.PSII * 2", label: "LEF" },
          { of: "scan.cyclic_electron_flow", label: "CEF" },
          { of: "scan.mehler", label: "Mehler", axis: "right" },
          { of: "scan.PTOX", label: "PTOX", axis: "right" },
        ],
        xLabel: "PPFD (µmol m⁻² s⁻¹)",
        yLabel: "mmol e⁻ / mol Chl / s",
      },
      {
        type: "line",
        title: "Energy and redox status",
        x: "scan.x",
        y: [
          { of: "scan.ATP_per_tot", label: "ATP" },
          { of: "scan.NADPH_per_tot", label: "NADPH" },
          { of: "scan.Fd_ox_per_tot", label: "Fd ox" },
          { of: "scan.PQ_ox_per_tot", label: "PQ ox" },
          { of: "scan.PC_ox_per_tot", label: "PC ox" },
          { of: "scan.H2O2", label: "H2O2", axis: "right" },
        ],
        xLabel: "PPFD (µmol m⁻² s⁻¹)",
        yLabel: "Fraction of the pool",
        yRightLabel: "Concentration (mM)",
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
    scenarios: sweep("k", log2Fold, (e) => ({
      // The notebook drops the points that don't converge.
      allowFailure: true,
      parameters: {
        PPFD: 1000,
        kf_cyclic_electron_flow: `param.kf_cyclic_electron_flow * ${2 ** e}`,
      },
    })),
    collect: { scan: lastOf(sweepIds("k", 200), log2Fold, fig4Columns) },
    plots: [
      {
        type: "line",
        title: "Photosynthetic electron fluxes",
        x: "scan.x",
        y: [
          { of: "scan.PSI", label: "PSI" },
          { of: "scan.PSII * 2", label: "LEF" },
          { of: "scan.cyclic_electron_flow", label: "CEF" },
          { of: "scan.H2O2", label: "H2O2", axis: "right" },
        ],
        xLabel: "log₂-fold change in PGR5 activity",
        yLabel: "mmol e⁻ / mol Chl / s",
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
    plots: [
      {
        type: "line",
        title: "Fd redox state",
        x: "wt.time",
        y: [
          { of: "ko.Fd_ox_per_tot", label: "PGR-5 KO" },
          { of: "wt.Fd_ox_per_tot", label: "wild type" },
        ],
        xLabel: "Time (s)",
        yLabel: "Fd redox state",
      },
      {
        type: "line",
        title: "RuBisCO rate",
        x: "wt.time",
        y: [
          { of: "ko.rubisco_carboxylase", label: "PGR-5 KO" },
          { of: "wt.rubisco_carboxylase", label: "wild type" },
        ],
        xLabel: "Time (s)",
        yLabel: "Rate of RuBisCO (mM/s)",
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
    scenarios: Object.assign({}, ...LIGHTS.map(mcaScenarios)),
    collect: Object.fromEntries(LIGHTS.map((l) => [`mca${l}`, mcaTable(l)])),
    plots: LIGHTS.flatMap((l) => [
      heatmap(l, "Flux control", CONTROL_FLUXES),
      heatmap(l, "Concentration control", CONTROL_VARIABLES),
    ]),
    golden: mcaGolden,
  },
];
