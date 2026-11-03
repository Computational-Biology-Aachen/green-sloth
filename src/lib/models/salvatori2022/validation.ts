import { step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  PreRun,
  ProtocolStep,
  Scenario,
  Validation,
} from "#lib/validation/types.js";

/** The "Minn" leaf; the model's defaults are the "Eiko" one. */
const MINN = {
  alpha: 0.54,
  c_in: 0.25,
  Ec_PSII: 9.98,
  v_ETR: 11.56,
  v_d: 7.0,
  Qc: 0.03,
  v_NPQ: 53.87,
  v_p: 0.01,
  v_C: 13.04,
  eta_NADPH: 4.1,
  eta_NADP: 0.75,
  v_R: 0.0014,
  d: 3.69,
  c_y: 0,
};

const settle: PreRun = { kind: "timeCourse", tEval: [1] };
// The notebook reuses the state left by its last loop, which is Minn's, for
// every leaf of Figures 5 and 8.
const settleMinn: PreRun = { ...settle, set: MINN };

const fig3Steps: ProtocolStep[] = Array.from({ length: 59 }, (_, k) =>
  step(1, { PPFD: k === 0 ? 0 : (k + 1) % 2 === 0 ? 520 : 780 }, 1000),
);

/** Runs a square wave in the notebook's increments, floating point included. */
function wave(light: (t: number) => number): ProtocolStep[] {
  const steps: ProtocolStep[] = [];
  let t = 0;
  while (t < 60) {
    const next = t + 0.1;
    steps.push(step(next - t, { PPFD: light(t) }, 100));
    t = next;
  }
  return steps;
}

const square = (period: number) => (t: number) =>
  Math.floor(t / period) % 2 === 0 ? 520 : 780;

function goldens(ids: string[]): Record<string, GoldenSeries> {
  const out: Record<string, GoldenSeries> = {};
  ids.forEach((id, i) => {
    for (const col of ["A", "NPQ", "ETR_out"]) {
      out[`${col}_${i}`] = { x: `${id}.time`, y: `${id}.${col}` };
    }
  });
  return out;
}

interface Bar {
  from: number;
  to: number;
  color: string;
  label?: string;
}

/**
 * The notebook's three stacked panels. `legendAt` is the panel with the line
 * legend; `bars` are its light protocol lines above the top panel, which get
 * legend entries of their own.
 */
function panels(
  ids: string[],
  labels: string[],
  colors: string[],
  legendAt: number,
  bars: Bar[] = [],
): Validation["plots"] {
  const barLegend = bars
    .filter((b) => b.label)
    .map((b) => ({
      of: "data.none",
      x: "data.none",
      label: b.label,
      color: b.color,
    }));
  const panel = (
    k: number,
    col: string,
    yLabel: string,
    yLim: [number, number],
    yTicks: number[],
  ) => ({
    type: "line" as const,
    x: `${ids[0]}.time`,
    y: [
      ...ids.map((id, i) => ({
        of: `${id}.${col}`,
        color: colors[i],
        ...(k === legendAt ? { label: labels[i] } : {}),
      })),
      ...(k === 0 ? barLegend : []),
    ],
    ...(k === 2 ? { xLabel: "time [min]" } : {}),
    yLabel,
    xLim: [0, 60] as [number, number],
    yLim,
    yTicks,
    ...(k === 0 && bars.length
      ? {
          phases: bars.map((b) => ({
            from: b.from,
            to: b.to,
            color: b.color,
            above: true,
          })),
        }
      : {}),
    legend: k === legendAt || (k === 0 && bars.length > 0),
  });
  return [
    panel(0, "ETR_out", "ETR [µmol m⁻² s⁻¹]", [0, 110], [0, 50, 100]),
    panel(1, "A", "A [µmol m⁻² s⁻¹]", [0, 20], [0, 5, 10, 15, 20]),
    // The notebook labels NPQ in µmol m⁻² s⁻¹, but it has no unit.
    panel(2, "NPQ", "NPQ", [0, 2.5], [0, 0.5, 1, 1.5, 2, 2.5]),
  ];
}

const LEAF_COLORS = ["forestgreen", "lightgreen"];
const FIG3_BARS: Bar[] = fig3Steps.map((st, i) => ({
  from: i,
  to: i + 1,
  color: st.set.PPFD === 0 ? "gray" : st.set.PPFD === 520 ? "yellow" : "orange",
}));
// One legend entry per light, as the notebook labels its first bar of each.
for (const [light, label] of [
  ["gray", "Dark"],
  ["yellow", "520 PPFD"],
  ["orange", "780 PPFD"],
]) {
  const first = FIG3_BARS.find((b) => b.color === light);
  if (first) first.label = label;
}

const fromMinn = (scenario: Scenario): Scenario => ({
  pre: [settleMinn],
  ...scenario,
});

export const validations: Validation[] = [
  {
    id: "fig3",
    title: "Figure 3: fluctuating light across leaves",
    simulate: { kind: "protocol", steps: fig3Steps },
    scenarios: {
      eiko: { pre: [settle] },
      minn: { parameters: MINN, pre: [settle] },
    },
    columns: 1,
    data: { none: [] },
    plots: panels(
      ["eiko", "minn"],
      ["Eiko", "MinnGold"],
      LEAF_COLORS,
      2,
      FIG3_BARS,
    ),
    golden: goldens(["eiko", "minn"]),
  },
  {
    id: "fig5",
    title: "Figure 5: constant light across leaves",
    simulate: {
      kind: "protocol",
      steps: [step(60, { PPFD: 650 }, 99)],
    },
    scenarios: {
      eiko: fromMinn({}),
      minn: fromMinn({ parameters: MINN }),
    },
    columns: 1,
    data: { none: [] },
    plots: panels(["eiko", "minn"], ["Eiko", "MinnGold"], LEAF_COLORS, 2, [
      { from: 0, to: 1, color: "black", label: "dark" },
      { from: 1, to: 60, color: "yellow", label: "650 PPFD" },
    ]),
    golden: goldens(["eiko", "minn"]),
  },
  {
    id: "fig8",
    title: "Figure 8: fluctuation periods",
    scenarios: {
      constant: fromMinn({
        simulate: { kind: "protocol", steps: wave(() => 650) },
      }),
      p05: fromMinn({
        simulate: { kind: "protocol", steps: wave(square(0.5)) },
      }),
      p1: fromMinn({ simulate: { kind: "protocol", steps: wave(square(1)) } }),
      p4: fromMinn({ simulate: { kind: "protocol", steps: wave(square(4)) } }),
    },
    columns: 1,
    plots: panels(
      ["constant", "p05", "p1", "p4"],
      ["constant", "30s", "1 min", "4 min"],
      ["black", "blue", "red", "lightgreen"],
      0,
    ),
    golden: goldens(["constant", "p05", "p1", "p4"]),
  },
];
