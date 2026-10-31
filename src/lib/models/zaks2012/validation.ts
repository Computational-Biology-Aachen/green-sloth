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

export const validations: Validation[] = [
  {
    id: "fig4",
    title: "Figures 3-5: NPQ, qE and lumen pH",
    ...tolerances,
    simulate: light(1000),
    scenarios: {
      wt1000: {},
      // The notebook's npq4 uses qtrigg3 = 1 at 1000 and 0 at 100 µmol; see
      // curatornotes.md.
      npq41000: { parameters: { qtrigg1: 0, qtrigg3: 1 } },
      wt100: { simulate: light(100) },
      npq4100: {
        simulate: light(100),
        parameters: { qtrigg1: 0, qtrigg3: 0 },
      },
    },
    ops: npq,
    derive: {
      qE1000: "wt1000.NPQ - npq41000.NPQ",
      qE100: "wt100.NPQ - npq4100.NPQ",
    },
    plots: [
      {
        type: "line",
        title: "qE at 100 µmol photon m⁻² s⁻¹",
        x: "npq4100.NPQ.time",
        y: [{ of: "qE100", label: "Simulation" }],
        xLabel: "Time (s)",
        yLabel: "qE",
        yLim: [-0.1, 1.5],
      },
      {
        type: "line",
        title: "qE at 1000 µmol photon m⁻² s⁻¹",
        x: "npq41000.NPQ.time",
        y: [{ of: "qE1000", label: "Simulation" }],
        xLabel: "Time (s)",
        yLabel: "qE",
        yLim: [-0.1, 2],
      },
      {
        type: "line",
        title: "Lumen pH at 100 µmol photon m⁻² s⁻¹",
        x: "wt100.time",
        y: [
          { of: "wt100.pH_lumen", label: "WT" },
          { of: "npq4100.pH_lumen", label: "npq4" },
        ],
        xLabel: "Time (s)",
        yLabel: "pH lumen",
      },
      {
        type: "line",
        title: "Lumen pH at 1000 µmol photon m⁻² s⁻¹",
        x: "wt1000.time",
        y: [
          { of: "wt1000.pH_lumen", label: "WT" },
          { of: "npq41000.pH_lumen", label: "npq4" },
        ],
        xLabel: "Time (s)",
        yLabel: "pH lumen",
      },
    ],
    golden: {
      qE1000: { x: "npq41000.NPQ.time", y: "qE1000" },
      qE100: { x: "npq4100.NPQ.time", y: "qE100" },
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
          { of: "kQ3e9.pH_lumen", label: "kQ = 3e9" },
          { of: "kQ1e10.pH_lumen", label: "kQ = 1e10" },
          { of: "kQ3e10.pH_lumen", label: "kQ = 3e10" },
          { of: "kQ1e11.pH_lumen", label: "kQ = 1e11" },
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
