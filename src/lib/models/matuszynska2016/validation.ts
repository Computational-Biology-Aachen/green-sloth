import { step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  Plot,
  ProtocolStep,
  Validation,
} from "#lib/validation/types.js";
import measured from "./assets/validation-data.json";

const PULSE = 5000;
const PULSE_LENGTH = 0.8;

/** Converts a light intensity to the internal activation rate, per species. */
const arabidopsis = (pfd: number) =>
  0.0005833 * pfd ** 2 + 0.2667 * pfd + 187.5;
const pothos = (pfd: number) => 0.0004167 * pfd ** 2 + 0.3333 * pfd + 862.5;

function intervals(
  duration: number,
  grow: number,
  first: number,
  numSteps?: number,
  last?: number,
): number[] {
  const phase: number[] = [];
  let total = 0;
  let current = first;
  while (
    total < duration &&
    (numSteps === undefined || phase.length < numSteps)
  ) {
    total += current;
    if (total < duration) phase.push(current);
    current = grow * phase.length + first;
  }
  if (last !== undefined) {
    phase.push(duration - last - phase.reduce((a, b) => a + b, 0));
    if (last !== 0) phase.push(last);
  }
  return phase;
}

/** Saturating pulses at growing intervals through dark, light, dark, light. */
function pamSteps(lightRate: number, darkMinutes: number): ProtocolStep[] {
  const phases: Array<[number[], number]> = [
    [[30], 0],
    [intervals(14 * 60, 20, 30), lightRate],
    [intervals(darkMinutes * 60, 20, 30, 5, 30), 0],
    [intervals(5 * 60, 20, 30, undefined, 0), lightRate],
  ];
  const steps = phases.flatMap(([times, rate]) =>
    times.flatMap((t) => [
      step(PULSE_LENGTH, { PPFD: PULSE }),
      step(t - PULSE_LENGTH, { PPFD: rate }),
    ]),
  );
  steps.push(step(5 * 60, { PPFD: lightRate }));
  return steps;
}

/** When each pulse ends, which is where the measurements are plotted. */
function pulseEnds(steps: ProtocolStep[]): number[] {
  const out: number[] = [];
  let t = 0;
  for (const s of steps) {
    t += s.duration;
    if (s.set.PPFD === PULSE) out.push(t);
  }
  return out;
}

const fig4Lights: Array<[number, number]> = [
  [100, 15],
  [300, 30],
  [900, 60],
];

const fig4Data: Record<string, number[]> = {};
const fig4Plots: Plot[] = [];
const fig4Scenarios: Validation["scenarios"] = {};
for (const [pfd, darkMinutes] of fig4Lights) {
  const id = `pfd${pfd}`;
  const steps = pamSteps(arabidopsis(pfd), darkMinutes);
  const rows = measured[String(pfd) as "100" | "300" | "900"];
  fig4Scenarios[id] = {
    simulate: { kind: "protocol", steps, pointsPerStep: 1000 },
  };
  fig4Data[`t${pfd}`] = pulseEnds(steps);
  fig4Data[`fm${pfd}`] = rows.Fm_rel_mean.slice(0, -1);
  fig4Data[`fmStd${pfd}`] = rows.Fm_rel_std.slice(0, -1);
  fig4Data[`ft${pfd}`] = rows.Ft_rel_mean.slice(0, -1);
  fig4Data[`ftStd${pfd}`] = rows.Ft_rel_std.slice(0, -1);
  fig4Plots.push({
    type: "line",
    title: `${pfd} µE m⁻² s⁻¹`,
    x: `${id}.time`,
    y: [
      { of: `${id}.Fluo / max(${id}.Fluo)`, label: "Simulated trace" },
      {
        of: `data.fm${pfd}`,
        x: `data.t${pfd}`,
        err: `data.fmStd${pfd}`,
        label: "Fm' measured",
        style: "markers",
      },
      {
        of: `data.ft${pfd}`,
        x: `data.t${pfd}`,
        err: `data.ftStd${pfd}`,
        label: "Fs measured",
        style: "markers",
      },
    ],
    xLabel: "Time (s)",
    yLabel: "Fluorescence (Fm' / Fm)",
    yLim: [0, 1.01],
  });
}

const fig5Lights = [100, 300, 900];
const fig5Columns = ["pH_lu", "zx", "psbs_pr", "Q"];
const scanLight = [
  ...new Set(
    [
      ...Array.from({ length: 50 }, (_, i) => (i * 1000) / 49),
      100,
      300,
      900,
    ].sort((a, b) => a - b),
  ),
];

const fig5Golden: Record<string, GoldenSeries> = {
  scan_pH_lu: { x: "scan.x", y: "scan.pH_lu" },
  scan_Q: { x: "scan.x", y: "scan.Q" },
};
for (const pfd of fig5Lights) {
  for (const c of fig5Columns) {
    fig5Golden[`${c}_${pfd}`] = { x: `t${pfd}.time`, y: `t${pfd}.${c}` };
  }
}

const pothosSteps = pamSteps(pothos(100), 16);

export const validations: Validation[] = [
  {
    id: "fig4",
    title: "Figure 4: PAM traces against measurements",
    data: fig4Data,
    scenarios: fig4Scenarios,
    plots: fig4Plots,
    golden: Object.fromEntries(
      fig4Lights.map(([pfd]) => [
        `Fluo${pfd}`,
        { x: `pfd${pfd}.time`, y: `pfd${pfd}.Fluo` },
      ]),
    ),
  },
  {
    id: "fig5",
    title: "Figure 5: lumen pH and quencher",
    scenarios: {
      ...Object.fromEntries(
        fig5Lights.map((pfd) => [
          `t${pfd}`,
          {
            simulate: {
              kind: "protocol" as const,
              pointsPerStep: 1000,
              steps: [
                step(30, { PPFD: 0 }),
                step(840, { PPFD: arabidopsis(pfd) }),
                step(960, { PPFD: 0 }),
                step(300, { PPFD: arabidopsis(pfd) }),
              ],
            },
          },
        ]),
      ),
    },
    scans: {
      scan: {
        over: { PPFD: scanLight },
        columns: ["pH_lu", "Q"],
        simulate: { kind: "steadyState" },
        allowFailure: true,
      },
    },
    plots: [
      {
        type: "line",
        x: "t100.time",
        y: fig5Lights.map((pfd) => ({ of: `t${pfd}.pH_lu`, label: `${pfd}` })),
        xLabel: "Time (s)",
        yLabel: "Lumen pH",
        yLim: [2, 8],
      },
      {
        type: "scatter",
        title: "Quencher against lumen pH",
        series: [
          ...fig5Lights.map((pfd) => ({
            x: `t${pfd}.Q`,
            y: `t${pfd}.pH_lu`,
            label: `${pfd}`,
          })),
          { x: "scan.Q", y: "scan.pH_lu", label: "Steady state" },
        ],
        xLabel: "Quencher activity [Q]",
        yLabel: "Lumen pH",
      },
    ],
    golden: fig5Golden,
  },
  {
    id: "fig6",
    title: "Figure 6: Pothos",
    data: {
      t: pulseEnds(pothosSteps),
      fm: measured.pothos100.Fm_rel_mean.slice(0, -1),
      fmStd: measured.pothos100.Fm_rel_std.slice(0, -1),
      ft: measured.pothos100.Ft_rel_mean.slice(0, -1),
      ftStd: measured.pothos100.Ft_rel_std.slice(0, -1),
      yieldTime: measured.pothos100.Timedelta_mean,
      yield: measured.pothos100.Yield_mean,
    },
    scenarios: {
      pothos: {
        parameters: { gamma_2: 1 },
        simulate: { kind: "protocol", steps: pothosSteps, pointsPerStep: 1000 },
      },
    },
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
        x: "pothos.time",
        y: [
          { of: "pothos.Fluo / max(pothos.Fluo)", label: "Simulated trace" },
          {
            of: "data.fm",
            x: "data.t",
            err: "data.fmStd",
            label: "Fm' measured",
            style: "markers",
          },
          {
            of: "data.ft",
            x: "data.t",
            err: "data.ftStd",
            label: "Fs measured",
            style: "markers",
          },
        ],
        xLabel: "Time (s)",
        yLabel: "Fluorescence (a.u.)",
        yLim: [0, 1],
      },
      {
        type: "line",
        x: "pothos.NPQ.time",
        y: [
          { of: "pothos.NPQ.phiPSII", label: "Simulation", style: "markers" },
          {
            of: "data.yield",
            x: "data.yieldTime",
            label: "Experiment",
            style: "markers",
          },
        ],
        xLabel: "Time (s)",
        yLabel: "ΦPSII",
        yLim: [0, 0.9],
      },
    ],
    golden: {
      Fluo: { x: "pothos.time", y: "pothos.Fluo" },
      phiPSII: { x: "pothos.NPQ.time", y: "pothos.NPQ.phiPSII", byIndex: true },
    },
  },
];
