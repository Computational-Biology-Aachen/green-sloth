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

function panels(ids: string[], labels: string[]): Validation["plots"] {
  const panel = (col: string, yLabel: string, yLim: [number, number]) => ({
    type: "line" as const,
    x: `${ids[0]}.time`,
    y: ids.map((id, i) => ({ of: `${id}.${col}`, label: labels[i] })),
    xLabel: "Time (min)",
    yLabel,
    xLim: [0, 60] as [number, number],
    yLim,
  });
  return [
    panel("ETR_out", "ETR (µmol m⁻² s⁻¹)", [0, 110]),
    panel("A", "A (µmol m⁻² s⁻¹)", [0, 20]),
    panel("NPQ", "NPQ", [0, 2.5]),
  ];
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
    plots: panels(["eiko", "minn"], ["Eiko", "MinnGold"]),
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
    plots: panels(["eiko", "minn"], ["Eiko", "MinnGold"]),
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
    plots: panels(
      ["constant", "p05", "p1", "p4"],
      ["constant", "30 s", "1 min", "4 min"],
    ),
    golden: goldens(["constant", "p05", "p1", "p4"]),
  },
];
