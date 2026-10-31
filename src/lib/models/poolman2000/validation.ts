import {
  defaultGrid,
  lastOf,
  linspace,
  sweep,
  sweepIds,
} from "#lib/validation/helpers.js";
import type { Validation } from "#lib/validation/types.js";

const phosphate = linspace(0.05, 0.7, 21);

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
    scenarios: sweep("p", phosphate, (value) => ({
      parameters: { Orthophosphate_external: value },
    })),
    collect: { scan: lastOf(sweepIds("p", 21), phosphate, ["ex_g1p"]) },
    plots: [
      {
        type: "line",
        x: "scan.x",
        y: [{ of: "scan.ex_g1p", label: "Starch flux" }],
        xLabel: "External orthophosphate (mM)",
        yLabel: "Starch flux",
      },
    ],
    golden: { starch: { x: "scan.x", y: "scan.ex_g1p" } },
  },
];
