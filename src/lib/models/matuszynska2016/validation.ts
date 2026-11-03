import { linspace, step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  Phase,
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

/**
 * The notebook's light bars above a plot: black while dark, white while lit,
 * pulses ignored, from `xMin` and cut at `xMax`. `offset` shifts the times.
 */
function lightBars(
  steps: ProtocolStep[],
  xMin: number,
  xMax: number,
  offset = 0,
): Phase[] {
  const bars: Phase[] = [];
  let t = offset;
  for (const s of steps) {
    t += s.duration;
    if (s.set.PPFD === PULSE) continue;
    const color = s.set.PPFD === 0 ? "black" : "white";
    const end = Math.min(t, xMax);
    const last = bars[bars.length - 1];
    if (last?.color === color) last.to = end;
    else
      bars.push({
        from: last?.to ?? xMin,
        to: end,
        color,
        edgeColor: "black",
        above: true,
      });
  }
  return bars;
}

/** Seconds on the axis, labelled in minutes. */
const minuteTicks = (minutes: number[]) => ({
  xTicks: minutes.map((m) => m * 60),
  xTickLabels: minutes.map(String),
});

const MEASURED = {
  style: "markers" as const,
  marker: "^" as const,
  markerSize: 3.5,
  errLineWidth: 0.5,
  capSize: 2.5,
};

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
  const xMax = (darkMinutes + 21) * 60;
  const bars = lightBars(steps, -60, xMax);
  // The first light bar names the intensity, the dark one its length.
  bars[1].text = pfd === 100 ? `${pfd} µE m⁻² s⁻¹` : String(pfd);
  bars[2].text = `${Math.ceil((bars[2].to - bars[2].from) / 60)} min`;
  bars[2].textColor = "white";
  fig4Plots.push({
    type: "line",
    x: `${id}.time`,
    y: [
      {
        of: `${id}.Fluo / max(${id}.Fluo)`,
        color: "#db85d8",
        ...(pfd === 100 ? { label: "Simulated trace" } : {}),
      },
      {
        of: `data.fm${pfd}`,
        x: `data.t${pfd}`,
        err: `data.fmStd${pfd}`,
        color: "black",
        ...MEASURED,
        ...(pfd === 100 ? { label: "F_M' measured" } : {}),
      },
      {
        of: `data.ft${pfd}`,
        x: `data.t${pfd}`,
        err: `data.ftStd${pfd}`,
        color: "#0071ad",
        ...MEASURED,
        ...(pfd === 100 ? { label: "F_S measured" } : {}),
      },
    ],
    xLabel: "Time (min)",
    ...(pfd === 100 ? { yLabel: "Fluorescence (F_M' / F_M)" } : {}),
    xLim: [-60, xMax],
    ...minuteTicks([0, 14, darkMinutes + 15, darkMinutes + 20]),
    yLim: [0, 1.01],
    yTicks: linspace(0, 1, 6),
    phases: bars,
    // The notebook's figure-wide legend.
    legend: pfd === 100,
    legendPosition: "bottom",
  });
}

const fig5Lights = [100, 300, 900];
const fig5Steps = (pfd: number) => [
  step(30, { PPFD: 0 }),
  step(840, { PPFD: arabidopsis(pfd) }),
  step(960, { PPFD: 0 }),
  step(300, { PPFD: arabidopsis(pfd) }),
];
const FIG5_STYLE: Record<number, { color: string; marker: "x" | "o" | "s" }> = {
  100: { color: "#e09a05", marker: "x" },
  300: { color: "#06966b", marker: "o" },
  900: { color: "#1571a3", marker: "s" },
};
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
const FIG6_X = {
  xLabel: "Time (min)",
  xLim: [-120, 36 * 60] as [number, number],
  ...minuteTicks([0, 14, 30, 35]),
};

export const validations: Validation[] = [
  {
    id: "fig4",
    title: "Figure 4: PAM traces against measurements",
    columns: 3,
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
              steps: fig5Steps(pfd),
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
    columns: 1,
    deriveEach: { t: "time - 30" },
    collect: {
      // The steady states at the three lights, marked on the curve.
      marked: {
        x: fig5Lights,
        columns: Object.fromEntries(
          ["Q", "pH_lu"].map((c) => [
            c,
            fig5Lights.map(
              (pfd) => `nth(scan.${c}, ${scanLight.indexOf(pfd)})`,
            ),
          ]),
        ),
      },
    },
    plots: [
      {
        type: "line",
        x: "t100.t",
        y: fig5Lights.map((pfd) => ({
          of: `t${pfd}.pH_lu`,
          x: `t${pfd}.t`,
          label: String(pfd),
          color: FIG5_STYLE[pfd].color,
        })),
        yLabel: "lumen pH",
        xLim: [-20, 2100],
        // The notebook hides this axis' tick labels; the panel below shares it.
        xTicks: [0, 840, 1800, 2100],
        xTickLabels: ["", "", "", ""],
        yLim: [2, 8],
        yTicks: linspace(3, 8, 6),
        phases: lightBars(fig5Steps(100), -20, 2100, -30),
        legend: true,
        legendPosition: "right",
      },
      {
        type: "line",
        x: "t100.t",
        y: (["psbs_pr", "zx"] as const).flatMap((c) =>
          fig5Lights.map((pfd) => ({
            of: `t${pfd}.${c}`,
            x: `t${pfd}.t`,
            label: `${c === "zx" ? "Zx" : "PsbSᴾ"} ${pfd}`,
            color: FIG5_STYLE[pfd].color,
            ...(c === "psbs_pr" ? { dash: "dashed" as const } : {}),
          })),
        ),
        xLabel: "Time [min]",
        yLabel: "Q components",
        xLim: [-20, 2100],
        xTicks: [0, 840, 1800, 2100],
        xTickLabels: ["0", "14", "30", "35"],
        yLim: [0, 0.9],
        yTicks: [0, 0.2, 0.5, 0.8],
        legend: true,
        legendPosition: "right",
      },
      {
        type: "line",
        x: "t100.Q",
        y: [
          ...fig5Lights.map((pfd) => ({
            of: `t${pfd}.pH_lu`,
            x: `t${pfd}.Q`,
            label: String(pfd),
            color: FIG5_STYLE[pfd].color,
            marker: FIG5_STYLE[pfd].marker,
            markerEdge: pfd === 100 ? FIG5_STYLE[pfd].color : "black",
          })),
          { of: "scan.pH_lu", x: "scan.Q", color: "red" },
          {
            of: "marked.pH_lu",
            x: "marked.Q",
            color: "red",
            style: "markers" as const,
            zorder: 1,
          },
        ],
        xLabel: "quencher activity [Q]",
        xLim: [0.05, 0.4],
        xTicks: linspace(0.1, 0.4, 4),
        legend: true,
        legendPosition: "right",
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
    columns: 1,
    plots: [
      {
        type: "line",
        x: "pothos.time",
        y: [
          {
            of: "pothos.Fluo / max(pothos.Fluo)",
            label: "Simulated trace",
            color: "#fa0100",
          },
          {
            of: "data.fm",
            x: "data.t",
            err: "data.fmStd",
            label: "F_M' measured",
            color: "black",
            ...MEASURED,
          },
          {
            of: "data.ft",
            x: "data.t",
            err: "data.ftStd",
            label: "F_S measured",
            color: "#0071ad",
            ...MEASURED,
          },
        ],
        ...FIG6_X,
        yLabel: "Fluorescence (a.u.)",
        yLim: [0, 1],
        yTicks: linspace(0, 1, 6),
        phases: lightBars(pothosSteps, -120, 36 * 60),
        legend: true,
      },
      {
        type: "line",
        x: "pothos.NPQ.time",
        y: [
          {
            of: "pothos.NPQ.phiPSII",
            label: "Simulation",
            color: "#fa0100",
            marker: "o",
          },
          {
            of: "data.yield",
            x: "data.yieldTime",
            label: "Experiment",
            color: "#0071ad",
            marker: "^",
          },
        ],
        ...FIG6_X,
        yLabel: "ΦPSII",
        yLim: [0, 0.9],
        yTicks: linspace(0, 0.8, 5),
        phases: lightBars(pothosSteps, -120, 36 * 60),
        legend: true,
      },
    ],
    golden: {
      Fluo: { x: "pothos.time", y: "pothos.Fluo" },
      phiPSII: { x: "pothos.NPQ.time", y: "pothos.NPQ.phiPSII", byIndex: true },
    },
  },
];
