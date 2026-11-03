import { linspace, step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  LinePlot,
  Plot,
  Scenario,
  Validation,
} from "#lib/validation/types.js";

type Genotype = {
  parameters: Record<string, number>;
  remove?: string[];
  initial?: Record<string, number>;
};

const NPQ1: Genotype = {
  parameters: {
    tau_0: 1.693954731,
    kappa_qZ: 0,
    kappa_QA: 0,
    kappa_QZ: 0,
    V_tot_WT: 49.8,
  },
  remove: [
    "VA",
    "AV",
    "AZ",
    "PAf",
    "PAb",
    "PZf",
    "PZb",
    "QAb",
    "QAf",
    "QZf",
    "QZb",
  ],
};
const NPQ4: Genotype = {
  parameters: {
    tau_0: 1.702050733,
    V_tot_WT: 40.6,
    kappa_QV: 0,
    kappa_QA: 0,
    kappa_QL: 0,
  },
  remove: ["QVf", "QAb", "QAf", "QZf", "QZb"],
};
const NPQ4NPQ1: Genotype = {
  parameters: {
    tau_0: 1.283586052,
    kappa_QV: 0,
    kappa_QA: 0,
    kappa_QZ: 0,
    kappa_QL: 0,
    kappa_qZ: 0,
    kappa_qI: 7.05,
  },
};
const LUT2: Genotype = {
  parameters: {
    tau_0: 1.49,
    V_tot_WT: 71.2,
    k_PV_f: 1.43,
    k_PV_b: 13.1,
    k_PA_f: 34.4,
    k_PA_b: 294,
    k_PZ_f: 74.1,
    k_PZ_b: 168,
    P_tot: 49.9,
    kappa_QL: 0,
    k_L_QL_f: 0,
    k_QL_b: 0,
  },
  remove: ["QLf", "QLb"],
  initial: { PL: 0 },
};
const ZEP2: Genotype = {
  parameters: { tau_0: 1.55, V_tot_WT: 10.7, k_AV: 0.006, k_ZA: 0.038 },
  initial: { PL: 152.7 },
};
const PIGMENT_RATES = {
  k_PV_f: 1.43,
  k_PV_b: 13.1,
  k_PA_f: 34.4,
  k_PA_b: 294,
  k_PZ_f: 74.1,
  k_PZ_b: 168,
};
const NPQ1LUT2: Genotype = {
  parameters: {
    tau_0: 1.453352343,
    V_tot_WT: 49.8,
    ...PIGMENT_RATES,
    kappa_qI: 7.04,
  },
  remove: [
    "VA",
    "AV",
    "AZ",
    "ZA",
    "PAf",
    "PAb",
    "PZf",
    "PZb",
    "QAb",
    "QAf",
    "QZf",
    "QZb",
  ],
  initial: { PL: 49.9 },
};
const ZEP2LUT2: Genotype = {
  parameters: {
    tau_0: 1.453352343,
    V_tot_WT: 10.7,
    ...PIGMENT_RATES,
    kappa_qI: 7.04,
  },
  initial: { PL: 49.9 },
};
const NPQ4LUT2: Genotype = {
  parameters: {
    tau_0: 1.453352343,
    V_tot_WT: 40.6,
    kappa_QV: 0,
    kappa_QA: 0,
    kappa_QL: 0,
    ...PIGMENT_RATES,
    kappa_qI: 7.04,
  },
  remove: ["QVf", "QVb", "QAb", "QAf", "QZf", "QZb"],
  initial: { PL: 49.9 },
};
const NPQ4ZEP2: Genotype = {
  parameters: {
    tau_0: 1.453352343,
    V_tot_WT: 10.7,
    kappa_QV: 0,
    kappa_QA: 0,
    kappa_QL: 0,
    kappa_qI: 7.04,
  },
  remove: ["QVf", "QVb", "QAb", "QAf", "QZf", "QZb"],
};

const DAMAGE = { k_L_damage: 0.03, k_D_damage: 0.00161 };
const DAMAGE_ZEP2 = { k_L_damage: 0.03, k_D_damage: 0.000161 };
const WT_PARAMS = { k_L_damage: 0.03, k_D_damage: 0.000161, kappa_qZ: 0.05 };

const WT: Genotype = { parameters: {} };

/** The genotype's parameters win over `before`, and `after` wins over them. */
const genotype = (
  g: Genotype,
  simulate: Scenario["simulate"],
  {
    before = {},
    after = {},
  }: { before?: Record<string, number>; after?: Record<string, number> },
): Scenario => ({
  parameters: { ...before, ...g.parameters, ...after },
  ...(g.remove
    ? { edits: g.remove.map((removeReaction) => ({ removeReaction })) }
    : {}),
  ...(g.initial ? { initial: g.initial } : {}),
  simulate,
});

const protocol = (durations: number[], first = 0) => ({
  kind: "protocol" as const,
  pointsPerStep: 1000,
  steps: durations.map((d, i) => step(d, { ppfd: (i + first) % 2 })),
});

const standard = protocol([1, 5, 10, 5]);
const base = protocol([1, 20]);
const mix = protocol([1, 3, 1, 1, 3, 9, 3]);

/**
 * The notebook's light bars: white while lit, black while dark, from the
 * axis' left edge, the first step ending at time 0.
 */
function lightBars(durations: number[], y: [number, number], xMin = -1) {
  let end = -durations[0];
  return durations.map((d, i) => {
    const from = i === 0 ? xMin : end;
    end += d;
    return {
      from,
      to: end,
      y,
      color: i % 2 === 1 ? "white" : "black",
      edgeColor: "black",
    };
  });
}

const STANDARD = [1, 5, 10, 5];

/** One genotype's τ, from the onset of light on, as Figures 2 and 3 draw it. */
const tauPlot = (
  id: string,
  panel: string,
  color: string,
  durations: number[],
  layout: Partial<LinePlot>,
): Plot => ({
  type: "line",
  panel,
  title: id,
  x: `${id}.t`,
  y: [{ of: `${id}.tau_Fluo`, color, lineWidth: 3, xRange: [0, Infinity] }],
  yLabel: "τ_avg",
  xLim: [-1, 20],
  yTicks: linspace(0, 1.5, 4),
  phases: lightBars(durations, [0, 0.1]),
  ...layout,
});

const tauGolden = (ids: string[]): Record<string, GoldenSeries> =>
  Object.fromEntries(
    ids.map((id) => [id, { x: `${id}.t`, y: `${id}.tau_Fluo` }]),
  );

const SHIFT = { t: "time - 1" };

const fig2: Record<string, Scenario> = {
  npq4npq1: genotype(NPQ4NPQ1, standard, { before: DAMAGE }),
  npq4: genotype(NPQ4, standard, { before: DAMAGE }),
  npq1: genotype(NPQ1, standard, { before: DAMAGE }),
  lut2: genotype(LUT2, standard, { before: DAMAGE }),
  zep2: genotype(ZEP2, standard, { before: DAMAGE_ZEP2 }),
};

const fig3: Record<string, Scenario> = {
  WT: genotype(WT, standard, { before: WT_PARAMS }),
  WT_base: genotype(WT, base, { before: WT_PARAMS }),
  WT_mix: genotype(WT, mix, { before: WT_PARAMS }),
  zep2lut2: genotype(ZEP2LUT2, standard, { after: DAMAGE }),
  npq1lut2: genotype(NPQ1LUT2, standard, { after: DAMAGE }),
  npq4lut2: genotype(NPQ4LUT2, standard, { after: DAMAGE }),
  npq4zep2: genotype(NPQ4ZEP2, standard, { after: DAMAGE }),
};

const snapshots = {
  kind: "protocol" as const,
  steps: base.steps,
  tEval: [1, 2, 4, 6, 21],
};
const fig4: Record<string, Scenario> = {
  npq4npq1: genotype(NPQ4NPQ1, snapshots, { after: DAMAGE }),
  npq4: genotype(NPQ4, snapshots, { after: DAMAGE }),
  npq1: genotype(NPQ1, snapshots, { after: DAMAGE }),
  lut2: genotype(LUT2, snapshots, { after: DAMAGE }),
  zep2: genotype(ZEP2, snapshots, { after: DAMAGE_ZEP2 }),
  WT: genotype(WT, snapshots, { before: WT_PARAMS }),
};
const NPQ_PARTS = ["NPQ_qI", "NPQ_V", "NPQ_A", "NPQ_Z_qE", "NPQ_L", "NPQ_Z_qZ"];
const SNAPSHOT_TIMES = [1, 3, 5, 20];

const fig4Golden: Record<string, GoldenSeries> = {};
for (const id of Object.keys(fig4)) {
  for (const part of NPQ_PARTS) {
    fig4Golden[`${id}_${part}`] = { x: `${id}.t`, y: `${id}.${part}` };
  }
}

// Each row multiplies these parameter groups, as the notebook's fig5_sim does.
const ENZYMES: Record<string, string[]> = {
  VDE: ["k_L_VA", "k_D_VA", "k_L_AZ"],
  ZEP: ["k_AV", "k_ZA"],
  PsbS: ["kappa_QV", "kappa_QA", "kappa_QZ", "kappa_QL"],
};

const enzymeScenario = (factors: Record<string, number>): Scenario => {
  const scaled: Record<string, string | number> = { ...WT_PARAMS };
  for (const [enzyme, factor] of Object.entries(factors)) {
    for (const p of ENZYMES[enzyme]) scaled[p] = `param.${p} * ${factor}`;
  }
  return { parameters: scaled, simulate: standard };
};

const FIG5_PANELS: Record<string, Array<Record<string, number>>> = {
  A: [{ VDE: 2 }, { VDE: 5 }, { VDE: 25 }],
  B: [{ ZEP: 2 }, { ZEP: 5 }, { ZEP: 25 }],
  C: [{ PsbS: 2 }, { PsbS: 5 }, { PsbS: 25 }],
  D: [
    { VDE: 1, ZEP: 5, PsbS: 2 },
    { VDE: 10, ZEP: 50, PsbS: 5 },
  ],
};
const fig5: Record<string, Scenario> = { WT: enzymeScenario({}) };
for (const [panel, rows] of Object.entries(FIG5_PANELS)) {
  rows.forEach((row, n) => {
    fig5[`${panel}${n}`] = enzymeScenario(row);
  });
}

/** As the notebook labels a row: every enzyme's factor, 1x when unchanged. */
const label = (row: Record<string, number>) =>
  ["VDE", "ZEP", "PsbS"].map((k) => `${row[k] ?? 1}x ${k}`).join(", ");

const FIG4_ORDER = ["npq4npq1", "npq4", "npq1", "lut2", "zep2", "WT"];
const NPQ_STYLE: Record<string, { label: string; color: string }> = {
  NPQ_qI: { label: "qI", color: "#7e2f8e" },
  NPQ_V: { label: "V", color: "#edb120" },
  NPQ_A: { label: "A", color: "#d95319" },
  NPQ_Z_qE: { label: "Z (qE)", color: "#77ac30" },
  NPQ_L: { label: "L", color: "#0072bd" },
  NPQ_Z_qZ: { label: "Z (qZ)", color: "#8fed8f" },
};

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: mutant fluorescence lifetime",
    deriveEach: SHIFT,
    scenarios: fig2,
    columns: 3,
    plots: ["npq4npq1", "npq4", "npq1", "lut2", "zep2"].map((id, i) =>
      tauPlot(id, "ABCDE"[i], "#fa5555", STANDARD, {}),
    ),
    golden: tauGolden(Object.keys(fig2)),
  },
  {
    id: "fig3",
    title: "Figure 3: wild type and double mutants",
    deriveEach: SHIFT,
    scenarios: fig3,
    columns: 4,
    plots: Object.keys(fig3).map((id, i) =>
      tauPlot(
        id,
        "ABCDEFG"[i],
        "#77ac30",
        id === "WT_base"
          ? [1, 20]
          : id === "WT_mix"
            ? [1, 3, 1, 1, 3, 9, 3]
            : STANDARD,
        { yLim: [0, 2], xTicks: linspace(0, 20, 3) },
      ),
    ),
    golden: tauGolden(Object.keys(fig3)),
  },
  {
    id: "fig4",
    title: "Figure 4: NPQ contributions",
    deriveEach: SHIFT,
    scenarios: fig4,
    columns: 2,
    plots: SNAPSHOT_TIMES.map((time, i): Plot => ({
      type: "stackedBar",
      panel: "ABCD"[i],
      title: `Time = ${time} mins`,
      categories: FIG4_ORDER,
      stacks: NPQ_PARTS.map((part) => ({
        ...NPQ_STYLE[part],
        of: FIG4_ORDER.map((id) => `nth(${id}.${part}, ${i + 1})`),
      })),
      // The notebook's label reads "NPQ contributon".
      yLabel: "NPQ contribution",
      yLim: [0, 6],
      yTicks: linspace(0, 6, 7),
      reverseLegend: true,
    })),
    golden: fig4Golden,
  },
  {
    id: "fig5",
    title: "Figure 5: overexpressing VDE, ZEP and PsbS",
    deriveEach: SHIFT,
    scenarios: fig5,
    columns: 2,
    plots: Object.entries(FIG5_PANELS).map(([panel, rows]): Plot => ({
      type: "line",
      panel,
      x: "WT.t",
      y: [
        { of: "WT.tau_Fluo", label: "WT", color: "black" },
        ...rows.map((row, n) => ({
          of: `${panel}${n}.tau_Fluo`,
          label: label(row),
          color: ["#ff6161", "#ffc233", "#47a3ff"][n],
          dash: "dashdot" as const,
        })),
      ].map((line) => ({ ...line, xRange: [0, Infinity] as [number, number] })),
      xLabel: "Time (min)",
      yLabel: "τ_avg",
      xLim: [-1, 20],
      yLim: [-0.1, 2],
      yTicks: linspace(0, 2, 5),
      phases: lightBars(STANDARD, [-0.1, 0]),
      legend: true,
    })),
    golden: tauGolden(Object.keys(fig5)),
  },
];
