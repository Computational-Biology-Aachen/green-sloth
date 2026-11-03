import { linspace, step } from "#lib/validation/helpers.js";
import type {
  Collect,
  GoldenSeries,
  LinePlot,
  LineSeries,
  ModelEdit,
  Plot,
  ProtocolStep,
  Scan,
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
const twoMinutes = {
  kind: "timeCourse" as const,
  tEval: [120],
};
const scanOf = (over: Scan["over"], edits?: ModelEdit[]): Scan => ({
  over: { PPFD: SCAN_LIGHTS, ...over },
  ...(edits ? { edits } : {}),
  columns: ["NPQ"],
  simulate: twoMinutes,
});

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

const BLACK_RED: Record<number, string> = { 100: "black", 500: "red" };
const simulated = (pfd: number) => `Simulated ${pfd} µmol m⁻² s⁻¹`;

/** Seconds on the axis, labelled in minutes, as the notebook does. */
const minutes = (lim: [number, number], step: number): Partial<LinePlot> => {
  const ticks: number[] = [];
  for (let t = Math.ceil(lim[0] / step) * step; t <= lim[1]; t += step) {
    if (t >= 0) ticks.push(t);
  }
  return {
    xLim: lim,
    xTicks: ticks,
    xTickLabels: ticks.map((t) => String(t / 60)),
  };
};

const deltaNpq = (g: string): Plot => ({
  type: "line",
  title: g,
  x: `${g}_100.time`,
  y: LIGHTS.map((pfd) => ({
    of: `${g}_${pfd}.NPQ - wt_${pfd}.NPQ`,
    color: BLACK_RED[pfd],
  })),
  xLabel: "Time (min)",
  yLabel: "ΔNPQ",
  ...minutes([0, 1500], 300),
  yLim: [-0.7, 0.7],
  yTicks: linspace(-0.6, 0.6, 5),
});

/** Figure 3's top row: a wild-type time course at both lights. */
const wtPanel = (
  column: string,
  title: string,
  yLim: [number, number],
  yTicks: number[],
  legend = false,
): Plot => ({
  type: "line",
  title,
  x: "wt_100.time",
  y: LIGHTS.map((pfd) => ({
    of: `wt_${pfd}.${column}`,
    x: `wt_${pfd}.time`,
    color: BLACK_RED[pfd],
    // The notebook's figure-wide legend.
    ...(legend ? { label: simulated(pfd) } : {}),
  })),
  xLabel: "Time (min)",
  ...minutes([0, 1500], 300),
  yLim,
  yTicks,
  legend,
});

const GREEN = "#0ef615";
const PINK = "#da56d7";
const BLUE = "#4f46d6";
const RED = "#ff0000";
const FIG4_X = minutes([-15, 300], 60);
const FLUX_AXIS = {
  lim: [-0.001, 0.009] as [number, number],
  ticks: linspace(0, 0.008, 5),
};

/** Figure 4: the wild type's ΔΨ, ΔpH and pmf, each on its own axis. */
const wtPotentials = (pfd: number): Plot => ({
  type: "line",
  title: `${pfd} µmol m⁻² s⁻¹ · WT`,
  x: `wt_${pfd}.time`,
  y: [
    { of: `wt_${pfd}.Dpsi`, color: "black" },
    { of: `wt_${pfd}.delta_pH_inVolts`, color: GREEN, axis: "dph" },
    { of: `wt_${pfd}.pmf`, color: PINK, axis: "right" },
  ],
  ...FIG4_X,
  yLabel: "ΔΨ(V)",
  yLim: [-0.005, 0.075],
  yTicks: linspace(0, 0.06, 4),
  yRightLabel: "pmf/V",
  yRightColor: PINK,
  yRightLim: [-0.005, 0.15],
  yRightTicks: linspace(0, 0.15, 4),
  axes: [
    {
      id: "dph",
      position: "left",
      label: "ΔpH/V",
      color: GREEN,
      lim: [0, 0.12],
      ticks: linspace(0, 0.12, 7),
    },
  ],
});

/** Figure 4: a mutant's differences to the wild type, and its ion fluxes. */
const mutantPotentials = (
  g: "v" | "k",
  pfd: number,
  yLim: [number, number],
  yTicks: number[],
): Plot => {
  const d = (c: string) => `wt_${pfd}.${c} - ${g}_${pfd}.${c}`;
  const dphLim: [number, number] =
    g === "v" ? [-0.008, 0.008] : [-0.006, 0.006];
  return {
    type: "line",
    title: g === "v" ? "VCCN1" : "KEA3",
    x: `wt_${pfd}.time`,
    y: [
      { of: d("Dpsi"), color: "black" },
      { of: d("delta_pH_inVolts"), color: GREEN, axis: "dph" },
      { of: `(${d("ddt.K_lu")}) * 60`, color: BLUE, axis: "right" },
      { of: `(${d("ddt.Cl_lu")}) * 60`, color: RED, axis: "cl" },
    ],
    ...FIG4_X,
    yLabel: "ΔΔΨ(V)",
    yLim,
    yTicks,
    yRightLabel: "K⁺flux / M min⁻¹",
    yRightColor: BLUE,
    yRightLim: FLUX_AXIS.lim,
    yRightTicks: FLUX_AXIS.ticks,
    axes: [
      {
        id: "dph",
        position: "left",
        label: "ΔΔpH/V",
        color: GREEN,
        lim: dphLim,
      },
      {
        id: "cl",
        position: "right",
        label: "Cl⁻flux / M min⁻¹",
        color: RED,
        ...FLUX_AXIS,
      },
    ],
  };
};

/** Figure 4's right column: the triple mutant's differences, without a y scale. */
const tripleMutant = (pfd: number, half: "top" | "bottom"): Plot => {
  const d = (c: string) => `wt_${pfd}.${c} - vck_${pfd}.${c}`;
  const lines =
    half === "top"
      ? [
          { of: d("Dpsi"), color: "black" },
          { of: d("delta_pH_inVolts"), color: GREEN },
        ]
      : [
          { of: d("K_lu"), color: BLUE },
          { of: d("Cl_lu"), color: RED },
        ];
  const last = half === "bottom";
  return {
    type: "line",
    ...(half === "top" ? { title: `${pfd} µmol quanta m⁻² s⁻¹` } : {}),
    x: `wt_${pfd}.time`,
    y: lines,
    xLim: [0, 240],
    xTicks: last ? [7, 30, 60, 120, 180] : [],
    // The notebook labels this axis "Time (min)", but it is in seconds.
    ...(last ? { xLabel: "Time (s)" } : {}),
    yTicks: [],
    hLines: [{ value: 0, color: "black", dash: "dashed" }],
  };
};

const KEA3 = "#ed8f50";
const NOREG = "#dd1d21";
const VCCN1 = "#436c54";
const OSC_COLORS: Record<string, string> = {
  kea3: KEA3,
  vccn1: VCCN1,
  noreg: NOREG,
};

/** Figure 5B: ΔNPQ under oscillating light, with the KEA3 range marked. */
function oscPanel(period: number): Plot {
  const d = `osc${period}_kea3.NPQ - osc${period}_wt.NPQ`;
  const tail = `slice(${d}, -500, ${4 * POINTS_PER_STEP + 1})`;
  const top = `max(${tail}) + 0.01`;
  const bottom = `min(${tail}) - 0.01`;
  return {
    type: "line",
    title: `f = (${period} s)⁻¹`,
    x: `osc${period}_wt.time`,
    y: [
      ...Object.entries(OSC_COLORS).map(([g, color]) => ({
        of: `osc${period}_${g}.NPQ - osc${period}_wt.NPQ`,
        color,
      })),
      ...[top, bottom].map((v) => ({
        of: `data.bracketX * 0 + ${v}`,
        x: "data.bracketX",
        color: "black",
      })),
    ],
    yLabel: "Δ NPQ",
    xLim: [0, 4000],
    yLim: [-0.4, 0.35],
    annotations: [{ text: "Δ NPQ", x: 3750, y: `${top} + 0.03` }],
  };
}

/** The light below Figure 5B: 500, then 500 ± 400 µmol from 1000 s. */
function lightPattern(period: number, key: string) {
  const sine = linspace(1000, 4000, 1000);
  return {
    [`${key}X`]: [-100, 0, 0, 1000, ...sine],
    [`${key}Y`]: [
      0,
      0,
      500,
      500,
      ...sine.map((x) => 500 + 400 * Math.sin((2 * Math.PI * x) / period)),
    ],
  };
}

const lightPanel = (key: string): Plot => ({
  type: "line",
  x: `data.${key}X`,
  y: [{ of: `data.${key}Y`, color: "black" }],
  xLim: [-100, 4000],
  yLim: [0, 910],
  xTicks: [],
  yTicks: [],
  annotations: [
    { text: "500", x: 0, y: 600, align: "left" },
    { text: "900", x: 1000, y: 880, align: "right" },
    { text: "100", x: 1000, y: 180, align: "right" },
  ],
});

const CONC_COLORS = ["#804f41", "#e88a2a", "#c1bb52", "#426d53", "#326576"];
const ONE = ABUNDANCE.indexOf(1);

/** Figure 5C: ΔpH against the WT abundance, the start and the end of the light. */
function concPanels(name: string): Plot[] {
  const lim: [number, number] = name === "kea3" ? [-0.05, 0.03] : [-0.03, 0.05];
  const y = ABUNDANCE.map((factor, i) => ({
    of: `conc100_${name}_${i}.delta_pH_inVolts - conc100_${name}_${ONE}.delta_pH_inVolts`,
    label: String(factor),
    color: CONC_COLORS[i],
  }));
  return [
    {
      type: "line",
      title: `${name.toUpperCase()} · 100 µmol quanta m⁻² s⁻¹`,
      x: `conc100_${name}_${ONE}.time`,
      y,
      yLabel: "Δ pH (V)",
      ...minutes([0, 180], 60),
      yLim: lim,
      yTicks:
        name === "kea3" ? linspace(-0.04, 0.02, 4) : linspace(-0.02, 0.04, 4),
      legend: name === "kea3",
    },
    {
      type: "line",
      x: `conc100_${name}_${ONE}.time`,
      y,
      ...minutes([19 * 60, 22 * 60], 60),
      yLim: lim,
      yTicks: [],
      legend: false,
    },
  ];
}

/** ΔpH and ΔΨ against WT abundance: over the first 50 s, and at 20 min. */
function pointTable(name: string) {
  const at = (id: string, c: string, t: number) =>
    `at(${id}.${c}, ${t}, ${id}.time)`;
  const out: Record<string, Collect> = {};
  for (const when of ["initial", "steadystate"] as const) {
    const columns: Record<string, string[]> = {};
    for (const pfd of LIGHTS) {
      for (const c of ["delta_pH_inVolts", "Dpsi"]) {
        const one = `conc${pfd}_${name}_${ONE}`;
        columns[`${c}_${pfd}`] = ABUNDANCE.map((_, i) => {
          const id = `conc${pfd}_${name}_${i}`;
          return when === "initial"
            ? `(${at(id, c, 50)} - ${at(id, c, 0)}) - (${at(one, c, 50)} - ${at(one, c, 0)})`
            : `${at(id, c, 1200)} - ${at(one, c, 1200)}`;
        });
      }
    }
    out[`${name}_${when}`] = { x: ABUNDANCE.map((_, i) => i), columns };
  }
  return out;
}

function pointPanel(name: string, when: "initial" | "steadystate"): Plot {
  const table = `${name}_${when}`;
  return {
    type: "line",
    x: `${table}.x`,
    y: LIGHTS.flatMap((pfd) =>
      (["delta_pH_inVolts", "Dpsi"] as const).map((c) => ({
        of: `${table}.${c}_${pfd}`,
        style: "markers" as const,
        marker: c === "Dpsi" ? ("^" as const) : ("o" as const),
        color: BLACK_RED[pfd],
        markerFace: "white",
        ...(name === "kea3" && when === "initial"
          ? { label: `${c === "Dpsi" ? "ΔΨ" : "ΔpH"}, ${pfd}` }
          : {}),
      })),
    ),
    ...(name === "kea3" ? { yLabel: "Δ pH or ΔΨ (V)" } : {}),
    ...(when === "steadystate" ? { xLabel: "Abundance relative to WT" } : {}),
    xTicks: [0, 1, 2, 3, 4],
    xTickLabels: ABUNDANCE.map(String),
    yLim: [-0.04, 0.04],
    yTicks: linspace(-0.04, 0.04, 5),
    hLines: [{ value: 0, color: "black", dash: "dashed" }],
    annotations: [
      {
        text: `${name.toUpperCase()} ${when === "initial" ? "initial" : "steady state"}`,
        x: 0.5,
        y: 0.94,
        coords: "axes",
      },
    ],
    legend: name === "kea3" && when === "initial",
  };
}

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
    // The notebook's ΔΔpH and DES panels hold no data; they are left out.
    columns: [3, 7],
    scenarios: genotypes(fig3Sim),
    plots: [
      wtPanel("QA", "qL", [0, 1.2], linspace(0, 1.2, 7), true),
      wtPanel("PhiPSII", "ΦII", [0, 1], linspace(0, 1, 6)),
      wtPanel("NPQ", "NPQ", [0, 2.5], linspace(0, 2, 3)),
      ...MUTANTS.map(deltaNpq),
    ],
    golden: fig3Golden,
  },
  {
    id: "fig4",
    title: "Figure 4: membrane potential and ion fluxes",
    // The notebook's left 3 x 2 grid, then its right column's triple-mutant
    // panels below it, in the same light columns.
    columns: 2,
    returnRhs: true,
    scenarios: genotypes(fig4Sim, FIG4_GENOTYPES),
    plots: [
      wtPotentials(100),
      wtPotentials(500),
      mutantPotentials("v", 100, [-0.009, 0.009], linspace(-0.008, 0.008, 9)),
      mutantPotentials("v", 500, [-0.009, 0.004], linspace(-0.008, 0.004, 7)),
      mutantPotentials("k", 100, [-0.006, 0.006], linspace(-0.006, 0.006, 7)),
      mutantPotentials("k", 500, [-0.006, 0.006], linspace(-0.006, 0.006, 7)),
      tripleMutant(100, "top"),
      tripleMutant(500, "top"),
      tripleMutant(100, "bottom"),
      tripleMutant(500, "bottom"),
    ],
    golden: fig4Golden,
  },
  {
    id: "fig5a",
    title: "Figure 5, row A: KEA3 regulation",
    columns: 3,
    scenarios: FIG5_A,
    scans: {
      scan_wt: scanOf({}),
      scan_kea3: scanOf({ k_KEA3: [0] }),
      scan_noreg: scanOf({}, NO_REGULATION),
    },
    plots: [
      ...(["wt", "k_noreg"] as const).map((ref, i): Plot => ({
        type: "line",
        title: i === 0 ? "With KEA3 regulation" : "Without KEA3 regulation",
        x: "k_100.time",
        y: LIGHTS.map((pfd) => ({
          of: `k_${pfd}.NPQ - ${ref}_${pfd}.NPQ`,
          color: BLACK_RED[pfd],
          // The notebook's figure-wide legend.
          ...(i === 0 ? { label: simulated(pfd) } : {}),
        })),
        xLabel: "Time/min",
        ...minutes([0, 1500], 300),
        yLabel: "Δ NPQ",
        yLim: [-0.1, 0.7],
        yTicks: linspace(0, 0.6, 3),
        legend: i === 0,
      })),
      {
        type: "line",
        x: "scan_wt.x",
        y: [
          {
            of: "scan_kea3.NPQ - scan_wt.NPQ",
            label: "With KEA3 regulation",
            color: KEA3,
          },
          {
            of: "scan_kea3.NPQ - scan_noreg.NPQ",
            label: "Without KEA3 regulation",
            color: NOREG,
          },
          {
            of: "abs(scan_noreg.NPQ - scan_wt.NPQ)",
            label: "KEA3 inactivation",
            color: "black",
            dash: "dashed" as const,
          },
        ].map((line): LineSeries => ({
          ...line,
          marker: "o",
          markerEdge: "black",
        })),
        xLabel: "Light intensity/µmol quanta m⁻² s⁻¹",
        yLabel: "ΔNPQ @ 2 min",
        xLim: [0, 1000],
        xTicks: linspace(0, 1000, 6),
        yLim: [0, 0.375],
        yTicks: linspace(0, 0.3, 4),
        legend: true,
      },
    ],
    golden: {
      ...Object.fromEntries(
        LIGHTS.map((pfd) => [
          `noreg_${pfd}`,
          { x: `k_noreg_${pfd}.time`, y: `k_noreg_${pfd}.NPQ` },
        ]),
      ),
      scan_wt: { x: "scan_wt.x", y: "scan_wt.NPQ" },
      scan_kea3: { x: "scan_kea3.x", y: "scan_kea3.NPQ" },
      scan_noreg: { x: "scan_noreg.x", y: "scan_noreg.NPQ" },
    },
  },
  {
    id: "fig5b",
    title: "Figure 5, row B: oscillating light",
    columns: [3, 2],
    scenarios: oscScenarios,
    data: {
      bracketX: [3500, 4000],
      ...lightPattern(5, "p5"),
      ...lightPattern(120, "p120"),
    },
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
      oscPanel(5),
      oscPanel(120),
      {
        type: "line",
        x: "amplitude.x",
        y: [
          { of: "amplitude.kea3", label: "KEA3", color: KEA3 },
          { of: "amplitude.vccn1", label: "VCCN1", color: VCCN1 },
          { of: "amplitude.noreg", label: "KEA3 no reg", color: NOREG },
        ].map((line): LineSeries => ({
          ...line,
          marker: "o",
          markerEdge: "black",
        })),
        xLabel: "f⁻¹ (s)",
        yLabel: "Δ NPQ",
        xLim: [0, 1000],
        xTicks: linspace(0, 1000, 6),
        yLim: [0, 0.25],
        yTicks: linspace(0, 0.2, 3),
        legend: true,
      },
      lightPanel("p5"),
      lightPanel("p120"),
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
    // The notebook's time-to-extrema panel needs the extrema of a difference
    // between two runs, which no op computes; it is left out.
    columns: 4,
    scenarios: concScenarios,
    collect: {
      ...pointTable("kea3"),
      ...pointTable("vccn1"),
    },
    plots: [
      ...concPanels("kea3"),
      pointPanel("kea3", "initial"),
      pointPanel("vccn1", "initial"),
      ...concPanels("vccn1"),
      pointPanel("kea3", "steadystate"),
      pointPanel("vccn1", "steadystate"),
    ],
    golden: concGolden,
  },
];

export const validations = figures.map(withLsoda);
