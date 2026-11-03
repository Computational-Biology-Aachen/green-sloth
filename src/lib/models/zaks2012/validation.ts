import type { ProtocolStep, Validation } from "#lib/validation/types.js";

const MEASURE = 0.001;
const SATURATING = 7000;
const FLASH = 0.5;

const flashed = (seconds: number) => [seconds, FLASH, 2 - FLASH];
const repeat = <T>(xs: T[], n: number): T[] =>
  Array.from({ length: n }, () => xs).flat();

/** The light protocol of Zaks 2012 Figure 3 at actinic intensity `act`. */
function protocol(act: number): ProtocolStep[] {
  const intensities = [
    ...[MEASURE, SATURATING, MEASURE],
    ...[MEASURE, SATURATING],
    ...repeat([act, SATURATING, act], 23),
    ...repeat([MEASURE, SATURATING, MEASURE], 15),
  ];
  const durations = [
    ...flashed(58),
    ...[60, FLASH],
    ...repeat(flashed(7), 2),
    ...repeat(flashed(13), 10),
    ...repeat(flashed(28), 4),
    ...repeat(flashed(58), 7),
    ...repeat(flashed(7), 2),
    ...repeat(flashed(28), 3),
    ...repeat(flashed(58), 10),
  ];
  return durations.map((duration, i) => ({
    duration,
    set: { LightIntensity: intensities[i] },
  }));
}

const light = (act: number) =>
  ({ kind: "protocol", steps: protocol(act), pointsPerStep: 100 }) as const;

const npq = [
  {
    op: "pamNpq",
    as: "NPQ",
    fluo: "fluorescenceyield",
    pulse: { LightIntensity: SATURATING },
  },
];

const tolerances = { rtol: 1e-6, atol: 1e-8 };

const UMOL = "µmol photon m⁻² s⁻¹";

// The notebook's npq4 uses qtrigg3 = 1 at 1000 and 0 at 100 µmol; see
// curatornotes.md.
const pam = {
  wt1000: {},
  npq41000: { parameters: { qtrigg1: 0, qtrigg3: 1 } },
  wt100: { simulate: light(100) },
  npq4100: {
    simulate: light(100),
    parameters: { qtrigg1: 0, qtrigg3: 0 },
  },
};

const WT = { color: "black" };
const NPQ4 = { color: "red" };

export const validations: Validation[] = [
  {
    id: "fig3",
    title: "Figure 3: fluorescence, NPQ and qE",
    ...tolerances,
    simulate: light(1000),
    scenarios: { wt1000: pam.wt1000, npq41000: pam.npq41000 },
    ops: npq,
    derive: { qE1000: "wt1000.NPQ - npq41000.NPQ" },
    plots: [
      {
        type: "line",
        // The notebook titles this panel 100 µmol, but it shows the 1000 µmol
        // run, as the paper's Fig. 3A does.
        title: `1000 ${UMOL}`,
        x: "wt1000.time",
        y: [
          { of: "npq41000.fluorescenceyield", label: "npq4", ...NPQ4 },
          { of: "wt1000.fluorescenceyield", label: "WT", ...WT },
        ],
        xLabel: "Time (s)",
        yLabel: "Fluo",
        legend: true,
      },
      {
        type: "line",
        title: `1000 ${UMOL}`,
        x: "wt1000.NPQ.time",
        y: [
          {
            of: "npq41000.NPQ",
            x: "npq41000.NPQ.time",
            label: "npq4",
            ...NPQ4,
          },
          { of: "wt1000.NPQ", label: "WT", ...WT },
        ],
        xLabel: "Time (s)",
        yLabel: "NPQ",
        legend: true,
      },
      {
        type: "line",
        title: `1000 ${UMOL}`,
        x: "npq41000.NPQ.time",
        y: [{ of: "qE1000", label: "qE", ...WT }],
        xLabel: "Time (s)",
        yLabel: "NPQ",
        legend: true,
      },
    ],
  },
  {
    id: "fig4",
    title: "Figure 4: qE",
    ...tolerances,
    simulate: light(1000),
    scenarios: pam,
    ops: npq,
    derive: {
      qE1000: "wt1000.NPQ - npq41000.NPQ",
      qE100: "wt100.NPQ - npq4100.NPQ",
    },
    plots: [
      {
        type: "line",
        title: `100 ${UMOL}`,
        x: "wt100.NPQ.time",
        y: [{ of: "qE100", label: "Simulation", ...WT, lineWidth: 4 }],
        xLabel: "Time (s)",
        yLim: [-0.1, 1.5],
        legend: true,
      },
      {
        type: "line",
        title: `1000 ${UMOL}`,
        x: "wt1000.NPQ.time",
        y: [{ of: "qE1000", label: "Simulation", ...WT, lineWidth: 4 }],
        xLabel: "Time (s)",
        yLim: [-0.1, 2],
        legend: true,
      },
    ],
    golden: {
      qE1000: { x: "npq41000.NPQ.time", y: "qE1000" },
      qE100: { x: "npq4100.NPQ.time", y: "qE100" },
    },
  },
  {
    id: "fig5",
    title: "Figure 5: lumen pH",
    ...tolerances,
    simulate: light(1000),
    scenarios: pam,
    plots: [
      {
        type: "line",
        title: `100 ${UMOL}`,
        x: "wt100.time",
        y: [
          { of: "wt100.pH_lumen", label: "WT", ...WT },
          { of: "npq4100.pH_lumen", label: "npq4", ...NPQ4 },
        ],
        xLabel: "Time (s)",
        yLabel: "pH lumen",
        legend: true,
      },
      {
        type: "line",
        title: `1000 ${UMOL}`,
        x: "wt1000.time",
        y: [
          { of: "wt1000.pH_lumen", label: "WT", ...WT },
          { of: "npq41000.pH_lumen", label: "npq4", ...NPQ4 },
        ],
        xLabel: "Time (s)",
        legend: true,
      },
    ],
    golden: {
      wt1000_pH: { x: "wt1000.time", y: "wt1000.pH_lumen" },
      npq41000_pH: { x: "npq41000.time", y: "npq41000.pH_lumen" },
    },
  },
  {
    id: "fig6",
    title: "Figure 6: lumen pH across kQ",
    ...tolerances,
    simulate: light(1000),
    scenarios: {
      kQ3e9: {},
      kQ1e10: { parameters: { kQ: 1e10 } },
      kQ3e10: { parameters: { kQ: 3e10 } },
      kQ1e11: { parameters: { kQ: 1e11 } },
    },
    plots: [
      {
        type: "line",
        x: "kQ3e9.time",
        y: [
          {
            of: "kQ3e9.pH_lumen",
            label: "kQ = 3e9",
            color: "#960000",
            lineWidth: 4,
          },
          {
            of: "kQ1e10.pH_lumen",
            label: "kQ = 1e10",
            color: "#008100",
            lineWidth: 4,
          },
          {
            of: "kQ3e10.pH_lumen",
            label: "kQ = 3e10",
            color: "#ff4c00",
            lineWidth: 4,
          },
          {
            of: "kQ1e11.pH_lumen",
            label: "kQ = 1e11",
            color: "#0030d1",
            lineWidth: 4,
          },
        ],
        xLabel: "Time (s)",
        yLabel: "pH lumen",
      },
    ],
    golden: {
      kQ1e10: { x: "kQ1e10.time", y: "kQ1e10.pH_lumen" },
      kQ1e11: { x: "kQ1e11.time", y: "kQ1e11.pH_lumen" },
    },
  },
];
