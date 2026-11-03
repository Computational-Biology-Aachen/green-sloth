import { defaultGrid, linspace } from "#lib/validation/helpers.js";
import type { Validation } from "#lib/validation/types.js";

const ELASTICITY_REACTIONS = [
  "rubisco_carboxylase",
  "fbpase",
  "SBPase",
  "phosphoribulokinase",
  "ex_g1p",
];
const ELASTICITY_VARIABLES = ["RUBP", "_3PGA", "FBP", "SBP", "RU5P", "ATP"];
const ELASTICITY_PARAMETERS = [
  "kcat_rubisco_carboxylase",
  "kcat_fbpase",
  "kcat_SBPase",
  "kcat_phosphoribulokinase",
  "Orthophosphate_external",
];

export const validations: Validation[] = [
  {
    id: "timecourse",
    title: "Time course",
    simulate: { kind: "timeCourse", tEval: defaultGrid(10) },
    scenarios: { wt: {} },
    plots: [
      {
        type: "line",
        x: "wt.time",
        y: [
          { of: "wt.BPGA", label: "BPGA" },
          { of: "wt.GAP", label: "GAP" },
        ],
        xLabel: "Time (s)",
        yLabel: "Concentration (mM)",
      },
    ],
    golden: {
      BPGA: { x: "wt.time", y: "wt.BPGA" },
      GAP: { x: "wt.time", y: "wt.GAP" },
      vRubisco: { x: "wt.time", y: "wt.rubisco_carboxylase" },
    },
  },
  {
    id: "fig3",
    title: "Figure 3: effect of cytosolic phosphate",
    simulate: { kind: "steadyState" },
    scans: {
      scan: {
        over: { Orthophosphate_external: linspace(0.05, 0.7, 21) },
        columns: ["ex_g1p"],
      },
    },
    plots: [
      {
        type: "line",
        x: "scan.x",
        y: [{ of: "scan.ex_g1p", label: "ex_g1p" }],
        xLabel: "Orthophosphate (external)",
        yLabel: "Starch flux",
        // MxlPy's plot.lines draws a grid and a legend.
        grid: true,
        legend: true,
      },
    ],
    golden: { starch: { x: "scan.x", y: "scan.ex_g1p" } },
  },
  {
    id: "control",
    title: "Elasticities and local stability",
    mca: {
      byVariable: {
        type: "variableElasticities",
        at: "steadyState",
        wrt: ELASTICITY_VARIABLES,
        outputs: ELASTICITY_REACTIONS,
      },
      byParameter: {
        type: "parameterElasticities",
        wrt: ELASTICITY_PARAMETERS,
        outputs: ELASTICITY_REACTIONS,
      },
    },
    stability: { steadyState: {} },
    plots: [
      {
        type: "heatmap",
        title: "Variable elasticities at steady state",
        rows: ELASTICITY_REACTIONS,
        columns: ELASTICITY_VARIABLES,
        z: ELASTICITY_REACTIONS.map((r) =>
          ELASTICITY_VARIABLES.map((_, c) => `nth(byVariable.${r}, ${c})`),
        ),
      },
      {
        type: "heatmap",
        title: "Parameter elasticities at the initial state",
        rows: ELASTICITY_REACTIONS,
        columns: ELASTICITY_PARAMETERS,
        z: ELASTICITY_REACTIONS.map((r) =>
          ELASTICITY_PARAMETERS.map((_, c) => `nth(byParameter.${r}, ${c})`),
        ),
      },
      {
        type: "scatter",
        title: "Jacobian eigenvalues at steady state",
        series: [{ x: "steadyState.real", y: "steadyState.imag" }],
        xLabel: "Real part",
        yLabel: "Imaginary part",
      },
    ],
    golden: {
      ...Object.fromEntries(
        ELASTICITY_REACTIONS.flatMap((r) => [
          [`var_${r}`, { x: "byVariable.x", y: `byVariable.${r}` }],
          [`par_${r}`, { x: "byParameter.x", y: `byParameter.${r}` }],
        ]),
      ),
      eigReal: { x: "steadyState.x", y: "steadyState.real" },
      // Real parts span 1e11; on its own, the range hides the slow modes.
      eigRealSlow: {
        x: "slice(steadyState.x, 10, 16)",
        y: "slice(steadyState.real, 10, 16)",
      },
      eigImag: { x: "steadyState.x", y: "steadyState.imag" },
    },
  },
];
