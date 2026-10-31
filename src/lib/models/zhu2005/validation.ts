import { linspace } from "#lib/validation/helpers.js";
import type { Validation } from "#lib/validation/types.js";

/** Reconstructed from the printed Figure 3; only used for this validation. */
const figure3 = {
  P680Pheo_total: 0.16902,
  PQ_total: 1.01412,
  p: 1.0,
  k1_open: 3.26383e11,
  k1_closed: 5.22213e10,
  k01: 133.95,
  kox: 50.0,
  kr3: 80.0,
  kAd: 2.0e8,
  kUd_closed: 2.0e8,
};
const pool = figure3.P680Pheo_total;

const logTime = linspace(-8, 0, 401);

export const validations: Validation[] = [
  {
    id: "fig3",
    title: "Figure 3: fluorescence induction",
    rtol: 1e-8,
    atol: 1e-12,
    simulate: { kind: "timeCourse", tEval: logTime.map((t) => 10 ** t) },
    scenarios: {
      induction: {
        parameters: figure3,
        initial: {
          S0T: 0.2 * pool,
          S1T: 0.8 * pool,
          S2T: 0,
          S3T: 0,
          S0Tp: 0,
          S1Tp: 0,
          S2Tp: 0,
          S3Tp: 0,
          QA_QB: pool,
          QAred_QB: 0,
          QA_QBred: 0,
          QAred_QBred: 0,
          QA_QB2red: 0,
          QAred_QB2red: 0,
          PQH2: 3 * pool,
        },
      },
    },
    deriveEach: { logT: "log10(time)" },
    plots: [
      {
        type: "line",
        x: "induction.logT",
        y: [
          { of: "induction.F", label: "Fluorescence" },
          {
            of: "induction.QA_reduction_fraction",
            label: "Reduced QA",
            axis: "right",
          },
        ],
        xLabel: "Log time (s)",
        yLabel: "Fluorescence emission",
        yRightLabel: "Proportion of reduced QA",
        xLim: [-8, 0],
        yRightLim: [0, 1],
      },
    ],
    golden: {
      F: { x: "induction.time", y: "induction.F" },
      QA: { x: "induction.time", y: "induction.QA_reduction_fraction" },
    },
  },
];
