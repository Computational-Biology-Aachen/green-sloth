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

/**
 * The notebook draws F in the paper's units: held at its value at log t = -7
 * before then, and scaled so that span maps onto the printed 0.942 to 7.917.
 */
const BASELINE = logTime.findIndex((t) => t >= -7 - 1e-9);
const F0 = `nth(induction.F, ${BASELINE})`;
// 1 from log t = -7 on: a mask works element-wise in both engines.
const AFTER = logTime.map((_, i) => (i >= BASELINE ? 1 : 0));
const HELD = `induction.F * data.after + ${F0} * (1 - data.after)`;
const PAPER_UNITS = `0.942 + (${HELD} - ${F0}) / (last(induction.F) - ${F0}) * ${7.917 - 0.942}`;

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
    data: { after: AFTER },
    plots: [
      {
        type: "line",
        x: "induction.logT",
        y: [
          {
            of: PAPER_UNITS,
            label: "Fluorescence (a)",
            color: "black",
            lineWidth: 2,
          },
          {
            of: "induction.QA_reduction_fraction",
            label: "Reduced QA (b)",
            axis: "right",
            color: "black",
            dash: "dotted",
            marker: "v",
            markEvery: 8,
            markerSize: 3,
          },
        ],
        xLabel: "Log Time (s)",
        yLabel: "Fluorescence Emission (arbitrary unit)",
        yRightLabel: "Proportion of reduced QA",
        xLim: [-8, 0],
        yLim: [0, 10],
        yRightLim: [0, 1],
        grid: true,
        legend: true,
      },
    ],
    golden: {
      F: { x: "induction.time", y: "induction.F" },
      QA: { x: "induction.time", y: "induction.QA_reduction_fraction" },
    },
  },
];
