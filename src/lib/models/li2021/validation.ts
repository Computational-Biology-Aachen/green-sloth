import { step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  ModelEdit,
  Plot,
  ProtocolStep,
  Scenario,
  Validation,
} from "#lib/validation/types.js";

const GENOTYPES: Record<string, Record<string, number>> = {
  wt: {},
  c: { k_ClCe: 0 },
  v: { k_VCCN1: 0 },
  k: { k_KEA3: 0 },
  cv: { k_ClCe: 0, k_VCCN1: 0 },
  ck: { k_ClCe: 0, k_KEA3: 0 },
  vk: { k_VCCN1: 0, k_KEA3: 0 },
  vck: { k_ClCe: 0, k_VCCN1: 0, k_KEA3: 0 },
};
const MUTANTS = Object.keys(GENOTYPES).filter((g) => g !== "wt");
const LIGHTS = [100, 500];
const NO_REGULATION: ModelEdit[] = [{ setAssignment: "qL_act", to: "1" }];

const fig3Sim = (pfd: number) => ({
  kind: "protocol" as const,
  pointsPerStep: 100,
  steps: [step(20 * 60, { PPFD: pfd }), step(5 * 60, { PPFD: 0 })],
});

const genotypes = (
  simulate: (pfd: number) => Scenario["simulate"],
  names = Object.keys(GENOTYPES),
): Record<string, Scenario> => {
  const out: Record<string, Scenario> = {};
  for (const g of names) {
    for (const pfd of LIGHTS) {
      out[`${g}_${pfd}`] = {
        parameters: GENOTYPES[g],
        simulate: simulate(pfd),
      };
    }
  }
  return out;
};

const fig3Golden: Record<string, GoldenSeries> = {};
for (const pfd of LIGHTS) {
  for (const g of Object.keys(GENOTYPES)) {
    fig3Golden[`NPQ_${g}_${pfd}`] = {
      x: `${g}_${pfd}.time`,
      y: `${g}_${pfd}.NPQ`,
    };
  }
  for (const c of ["QA", "PhiPSII"]) {
    fig3Golden[`${c}_wt_${pfd}`] = { x: `wt_${pfd}.time`, y: `wt_${pfd}.${c}` };
  }
}

const fig4Sim = (pfd: number) => ({
  kind: "protocol" as const,
  pointsPerStep: 100,
  steps: [step(5 * 60, { PPFD: pfd })],
});
const FIG4_GENOTYPES = ["wt", "v", "k", "vck"];
const FIG4_COLUMNS = ["Dpsi", "delta_pH_inVolts", "pmf", "K_lu", "Cl_lu"];
const fig4Golden: Record<string, GoldenSeries> = {};
for (const g of FIG4_GENOTYPES) {
  for (const pfd of LIGHTS) {
    const id = `${g}_${pfd}`;
    for (const c of FIG4_COLUMNS) {
      fig4Golden[`${c}_${id}`] = { x: `${id}.time`, y: `${id}.${c}` };
    }
    fig4Golden[`K_flux_${id}`] = { x: `${id}.time`, y: `${id}.ddt.K_lu` };
    fig4Golden[`Cl_flux_${id}`] = { x: `${id}.time`, y: `${id}.ddt.Cl_lu` };
  }
}

// Figure 5, row A.
const SCAN_LIGHTS = [50, 100, 250, 500, 1000];
const SCAN_MODELS: Record<string, Scenario> = {
  wt: {},
  kea3: { parameters: { k_KEA3: 0 } },
  noreg: { edits: NO_REGULATION },
};
const twoMinutes = {
  kind: "timeCourse" as const,
  tEval: [120],
};
const scanScenarios: Record<string, Scenario> = {};
for (const [name, base] of Object.entries(SCAN_MODELS)) {
  SCAN_LIGHTS.forEach((pfd) => {
    scanScenarios[`scan_${name}_${pfd}`] = {
      ...base,
      parameters: { ...base.parameters, PPFD: pfd },
      simulate: twoMinutes,
    };
  });
}
const scanColumn = (name: string) =>
  SCAN_LIGHTS.map((pfd) => `last(scan_${name}_${pfd}.NPQ)`);

// Figure 5, row B: PPFD oscillates around 500 once `pfd_add` is switched on.
const PERIODS = [5, 75, 100, 120, 200, 300, 600, 900];
const OSC_GENOTYPES: Record<string, Scenario> = {
  wt: {},
  vccn1: { parameters: { k_VCCN1: 0 } },
  kea3: { parameters: { k_KEA3: 0 } },
  noreg: { edits: NO_REGULATION },
};
const POINTS_PER_STEP = 1000;
const oscSteps: ProtocolStep[] = [0, 400, 400, 400].map((add) =>
  step(1000, { pfd_add: add }),
);
const oscScenarios: Record<string, Scenario> = {};
for (const period of PERIODS) {
  for (const [name, base] of Object.entries(OSC_GENOTYPES)) {
    oscScenarios[`osc${period}_${name}`] = {
      ...base,
      edits: [
        ...(base.edits ?? []),
        { addParameter: "f", value: 1 / period },
        { addParameter: "pfd_add", value: 0 },
        {
          parameterToAssignment: "PPFD",
          to: `500 + pfd_add * sin(${2 * Math.PI} * f * time)`,
        },
      ],
      simulate: {
        kind: "protocol",
        steps: oscSteps,
        pointsPerStep: POINTS_PER_STEP,
      },
    };
  }
}
const oscAmplitude = (name: string) =>
  PERIODS.map((p) => {
    const d = `slice(osc${p}_${name}.NPQ - osc${p}_wt.NPQ, ${-p * 3}, ${4 * POINTS_PER_STEP + 1})`;
    return `max(${d}) - min(${d})`;
  });

// Figure 5, row C: transporter abundance.
const ABUNDANCE = [0.01, 0.1, 1, 10, 100];
const CONC_PARAMS: Record<string, string> = {
  vccn1: "k_VCCN1",
  kea3: "k_KEA3",
};
const concScenarios: Record<string, Scenario> = {};
const concGolden: Record<string, GoldenSeries> = {};
for (const pfd of LIGHTS) {
  for (const [name, param] of Object.entries(CONC_PARAMS)) {
    ABUNDANCE.forEach((factor, i) => {
      const id = `conc${pfd}_${name}_${i}`;
      concScenarios[id] = {
        parameters: { [param]: `param.${param} * ${factor}` },
        simulate: {
          kind: "protocol",
          pointsPerStep: POINTS_PER_STEP,
          steps: [
            step(50, { PPFD: pfd }),
            step(20 * 60 - 50, { PPFD: pfd }),
            step(5 * 60, { PPFD: 0 }),
          ],
        },
      };
      for (const c of ["delta_pH_inVolts", "Dpsi"]) {
        concGolden[`${c}_${id}`] = { x: `${id}.time`, y: `${id}.${c}` };
      }
    });
  }
}

const deltaNpq = (g: string): Plot => ({
  type: "line",
  title: g,
  x: `${g}_100.time`,
  y: LIGHTS.map((pfd) => ({
    of: `${g}_${pfd}.NPQ - wt_${pfd}.NPQ`,
    label: `${pfd} µmol m⁻² s⁻¹`,
  })),
  xLabel: "Time (s)",
  yLabel: "ΔNPQ",
  yLim: [-0.7, 0.7],
});

const FIG5_A = genotypes(fig3Sim, ["wt", "k"]);
for (const pfd of LIGHTS) {
  FIG5_A[`k_noreg_${pfd}`] = { edits: NO_REGULATION, simulate: fig3Sim(pfd) };
}

const withLsoda = (v: Validation): Validation => ({
  // scipy's Radau hits NaN in its Jacobian at the start; the notebook used LSODA.
  exportMethod: "LSODA",
  ...v,
});

const figures: Validation[] = [
  {
    id: "fig3",
    title: "Figure 3: ion channel mutants",
    scenarios: genotypes(fig3Sim),
    plots: [
      {
        type: "line",
        title: "NPQ",
        x: "wt_100.time",
        y: LIGHTS.map((pfd) => ({
          of: `wt_${pfd}.NPQ`,
          label: `${pfd} µmol m⁻² s⁻¹`,
        })),
        xLabel: "Time (s)",
        yLim: [0, 2.5],
      },
      ...MUTANTS.map(deltaNpq),
    ],
    golden: fig3Golden,
  },
  {
    id: "fig4",
    title: "Figure 4: membrane potential and ion fluxes",
    returnRhs: true,
    scenarios: genotypes(fig4Sim, FIG4_GENOTYPES),
    plots: LIGHTS.flatMap((pfd): Plot[] => [
      {
        type: "line",
        title: `WT at ${pfd}`,
        x: `wt_${pfd}.time`,
        y: [
          { of: `wt_${pfd}.Dpsi`, label: "ΔΨ" },
          { of: `wt_${pfd}.delta_pH_inVolts`, label: "ΔpH" },
          { of: `wt_${pfd}.pmf`, label: "pmf" },
        ],
        xLabel: "Time (s)",
        yLabel: "V",
      },
      ...["v", "k"].map((g): Plot => ({
        type: "line",
        title: `${g} at ${pfd}`,
        x: `wt_${pfd}.time`,
        y: [
          {
            of: `(wt_${pfd}.ddt.K_lu - ${g}_${pfd}.ddt.K_lu) * 60`,
            label: "K⁺ flux",
          },
          {
            of: `(wt_${pfd}.ddt.Cl_lu - ${g}_${pfd}.ddt.Cl_lu) * 60`,
            label: "Cl⁻ flux",
          },
        ],
        xLabel: "Time (s)",
        yLabel: "M min⁻¹",
      })),
    ]),
    golden: fig4Golden,
  },
  {
    id: "fig5a",
    title: "Figure 5, row A: KEA3 regulation",
    scenarios: { ...FIG5_A, ...scanScenarios },
    collect: {
      scan: {
        x: SCAN_LIGHTS,
        columns: {
          wt: scanColumn("wt"),
          kea3: scanColumn("kea3"),
          noreg: scanColumn("noreg"),
        },
      },
    },
    plots: [
      {
        type: "line",
        title: "ΔNPQ after 2 min",
        x: "scan.x",
        y: [
          { of: "scan.kea3 - scan.wt", label: "With KEA3 regulation" },
          { of: "scan.kea3 - scan.noreg", label: "Without KEA3 regulation" },
        ],
        xLabel: "Light intensity (µmol quanta m⁻² s⁻¹)",
        yLabel: "ΔNPQ",
      },
    ],
    golden: {
      ...Object.fromEntries(
        LIGHTS.map((pfd) => [
          `noreg_${pfd}`,
          { x: `k_noreg_${pfd}.time`, y: `k_noreg_${pfd}.NPQ` },
        ]),
      ),
      scan_wt: { x: "scan.x", y: "scan.wt" },
      scan_kea3: { x: "scan.x", y: "scan.kea3" },
      scan_noreg: { x: "scan.x", y: "scan.noreg" },
    },
  },
  {
    id: "fig5b",
    title: "Figure 5, row B: oscillating light",
    scenarios: oscScenarios,
    collect: {
      amplitude: {
        x: PERIODS,
        columns: {
          kea3: oscAmplitude("kea3"),
          vccn1: oscAmplitude("vccn1"),
          noreg: oscAmplitude("noreg"),
        },
      },
    },
    plots: [
      {
        type: "line",
        title: "ΔNPQ amplitude",
        x: "amplitude.x",
        y: [
          { of: "amplitude.kea3", label: "KEA3", style: "markers" },
          { of: "amplitude.vccn1", label: "VCCN1", style: "markers" },
          { of: "amplitude.noreg", label: "KEA3 no reg", style: "markers" },
        ],
        xLabel: "Period (s)",
        yLabel: "ΔNPQ",
        xLim: [0, 1000],
      },
    ],
    golden: {
      kea3: { x: "amplitude.x", y: "amplitude.kea3" },
      vccn1: { x: "amplitude.x", y: "amplitude.vccn1" },
      noreg: { x: "amplitude.x", y: "amplitude.noreg" },
    },
  },
  {
    id: "fig5c",
    title: "Figure 5, row C: transporter abundance",
    scenarios: concScenarios,
    plots: Object.keys(CONC_PARAMS).map((name): Plot => ({
      type: "line",
      title: `${name} at 100 µmol`,
      x: `conc100_${name}_2.time`,
      y: ABUNDANCE.map((factor, i) => ({
        of: `conc100_${name}_${i}.delta_pH_inVolts - conc100_${name}_2.delta_pH_inVolts`,
        label: `${factor}`,
      })),
      xLabel: "Time (s)",
      yLabel: "ΔpH (V)",
    })),
    golden: concGolden,
  },
];

export const validations = figures.map(withLsoda);
