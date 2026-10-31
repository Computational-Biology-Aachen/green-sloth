import type {
  GoldenSeries,
  Plot,
  ProtocolStep,
  Scenario,
  Validation,
} from "#lib/validation/types.js";
import forcing from "./assets/validation-forcing.json";

const GENOTYPES = ["col", "npq1", "npq4", "rca2", "rwt43", "spsa"] as const;
const AMPLITUDES = [100, 200, 500];
const SKIPPED_ROWS = 2;
const ROWS = 1260;

type Run = (typeof forcing.runs)[keyof typeof forcing.runs];
const runOf = (g: string, a: number) =>
  forcing.runs[`${g}_${a}` as keyof typeof forcing.runs] as Run;

/** PAR is split 10:0:90 blue:green:red; everything is in the model's SI units. */
const forcingAt = (run: Run, i: number) => ({
  Ib: run.PAR[i] * 0.1e-6,
  Ig: 0,
  Ir: run.PAR[i] * 0.9e-6,
  H2OR: run.H2OR[i] * 1e-3,
  CO2R: run.CO2R[i] * 1e-6,
  Ta: run.Tair[i],
  Tl: run.Tleaf[i],
});

const MUTANTS: Record<string, Pick<Scenario, "parameters" | "edits">> = {
  col: {},
  rca2: {
    parameters: {
      RCA: forcing.mutant.RCA_rca2,
      Jmax25: forcing.mutant.Jmax25_rca2,
    },
  },
  spsa: { parameters: { TPU25: forcing.mutant.TPU25_spsa } },
  npq4: { parameters: { Jmax25: forcing.mutant.Jmax25_npq4, KiqEp: 0 } },
  npq1: { parameters: { KiqEz: 0 } },
  rwt43: {
    parameters: { Jmax25: forcing.mutant.Jmax25_rwt43 },
    edits: [
      { setAssignment: "fRBss_r", to: "ifgt(PAR, 1e-22, fRBmax, fRBmin)" },
    ],
  },
};

function scenario(g: string, a: number): Scenario {
  const run = runOf(g, a);
  const first = forcingAt(run, 0);
  const times: number[] = [];
  const steps: ProtocolStep[] = [];
  let previousEnd = 0;
  // A row's forcing applies from its own time until the next row.
  for (let i = SKIPPED_ROWS; i < run.Time.length; i++) {
    const t = run.Time[i] - 3600;
    times.push(t);
    const end = t + 1e-6;
    steps.push({
      duration: end - previousEnd,
      set: forcingAt(run, Math.max(i - 1, SKIPPED_ROWS)),
    });
    previousEnd = end;
  }
  const mutant = MUTANTS[g];
  return {
    parameters: { ...forcing.base, ...first, ...mutant.parameters },
    ...(mutant.edits ? { edits: mutant.edits } : {}),
    initial: {
      Ci: first.CO2R,
      Cc: first.CO2R,
      Ccyt: first.CO2R,
      PR: 100e-6,
      ...(g === "npq4" ? { fP: 0 } : {}),
      ...(g === "npq1" ? { fZ: 0 } : {}),
    },
    pre: [{ kind: "timeCourse", tEval: [7200] }],
    simulate: { kind: "protocol", steps, tEval: times },
  };
}

/** Membership of the 1260 samples in each period's up and down half-cycles. */
const halfCycles = (period: number, from: number, up: boolean) => {
  const half = period / 2;
  return Array.from({ length: ROWS }, (_, i) => {
    if (i < from || i >= from + 600) return 0;
    const isUp = Math.floor((i - from) / half) % 2 === 0;
    return isUp === up ? 1 : 0;
  });
};
const whole = (from: number) =>
  Array.from({ length: ROWS }, (_, i) => (i >= from && i < from + 600 ? 1 : 0));

const data: Record<string, number[]> = {
  whole60: whole(660),
  whole120: whole(60),
  up60: halfCycles(60, 660, true),
  down60: halfCycles(60, 660, false),
  up120: halfCycles(120, 60, true),
  down120: halfCycles(120, 60, false),
};
const scenarios: Record<string, Scenario> = {};
const ids: string[] = [];
for (const g of GENOTYPES) {
  for (const a of AMPLITUDES) {
    const id = `${g}_${a}`;
    const run = runOf(g, a);
    ids.push(id);
    scenarios[id] = scenario(g, a);
    data[`${id}_photo`] = run.Photo.slice(SKIPPED_ROWS);
    data[`${id}_photoss`] = run.Photoss;
    data[`${id}_simss`] = run.simPhotoss;
  }
}

const lfue = (id: string, mask: string) =>
  `sum(${id}.Photo * 1e6 * data.${mask}) / sum(data.${id}_simss * data.${mask})`;
const measuredLfue = (id: string, mask: string) =>
  `sum(data.${id}_photo * data.${mask}) / sum(data.${id}_photoss * data.${mask})`;

/** One point per genotype, amplitude and period, in the notebook's order. */
const table = (masks: { 60: string; 120: string }) => {
  const points = ids.flatMap((id) => [
    [id, masks[60]] as const,
    [id, masks[120]] as const,
  ]);
  return {
    x: points.map((_, i) => i),
    columns: {
      sim: points.map(([id, m]) => lfue(id, m)),
      measured: points.map(([id, m]) => measuredLfue(id, m)),
    },
  };
};

const scatter = (t: string, lim: [number, number], title: string): Plot => ({
  type: "scatter",
  title,
  series: [{ x: `${t}.measured`, y: `${t}.sim` }],
  xLabel: "Measured LFUE",
  yLabel: "Simulated LFUE",
  lim,
  identity: true,
});

const golden: Record<string, GoldenSeries> = {
  whole: { x: "whole.x", y: "whole.sim" },
  up: { x: "up.x", y: "up.sim" },
  down: { x: "down.x", y: "down.sim" },
};
for (const id of ["col_100", "npq4_500", "rwt43_200", "rca2_500"]) {
  golden[`Photo_${id}`] = { x: `${id}.time`, y: `${id}.Photo` };
}

export const validations: Validation[] = [
  {
    id: "fig6",
    title: "Figure 6: lightfleck-use efficiency",
    data,
    scenarios,
    collect: {
      whole: table({ 60: "whole60", 120: "whole120" }),
      up: table({ 60: "up60", 120: "up120" }),
      down: table({ 60: "down60", 120: "down120" }),
    },
    plots: [
      scatter("whole", [0.8, 1.05], "Whole cycles"),
      scatter("up", [0.5, 1.1], "Increasing-light half cycles"),
      scatter("down", [1, 2.7], "Decreasing-light half cycles"),
    ],
    golden,
  },
];
