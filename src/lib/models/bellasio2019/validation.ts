import { lastOf, step } from "#lib/validation/helpers.js";
import type {
  GoldenSeries,
  Plot,
  Scenario,
  Simulation,
  Validation,
} from "#lib/validation/types.js";

const PPFD = [50, 75, 100, 150, 200, 500, 1000, 1500];
const CA = [
  400, 300, 200, 120, 100, 80, 60, 40, 400, 400, 400, 400, 500, 650, 850, 1050,
  1300,
];
const O2 = [210000, 20000];
const SCAN_COLUMNS = ["A", "gs", "v_FNR", "RUBP", "PGA", "Ract", "f_rubp"];

/** Each point is a 30 min simulation; only its end state is used. */
const halfHour: Simulation = { kind: "timeCourse", tEval: [1800] };

function scan(prefix: string, param: "PPFD" | "Ca", values: number[]) {
  const scenarios: Record<string, Scenario> = {};
  const ids: string[] = [];
  for (const value of values) {
    for (const o2 of O2) {
      const id = `${prefix}${ids.length}`;
      ids.push(id);
      scenarios[id] = {
        parameters: { Ca: 400, PPFD: 1500, [param]: value, p_o2: o2 },
        simulate: halfHour,
      };
    }
  }
  return { scenarios, ids };
}

const pfd = scan("pfd", "PPFD", PPFD);
const ca = scan("ca", "Ca", CA);
const seq = (n: number) => Array.from({ length: n }, (_, i) => i);

const scanPlot = (table: string, of: string, yLabel: string): Plot => ({
  type: "line",
  x: `${table}.x`,
  y: [{ of, style: "markers" }],
  xLabel: table === "pfd" ? "Scan point (PPFD × O₂)" : "Scan point (Ca × O₂)",
  yLabel,
});

const transientGolden = (ids: string[], columns: string[]) => {
  const out: Record<string, GoldenSeries> = {};
  for (const id of ids) {
    for (const c of columns) {
      out[`${c}_${id}`] = { x: `${id}.t`, y: `${id}.${c}` };
    }
  }
  return out;
};

const TRANSIENT_COLUMNS = ["A", "v_ATPsynth", "gs", "RUBP", "ATP_st"];
const TRANSIENT_PARAMS = {
  vmax_v_RuBisCO_c: 0.18,
  chi_beta: 0.8,
  tau0: -0.12,
  Ki: 3600,
  Kd: 1200,
};
const ACCLIMATION = 400;

const transientPlots = (
  ids: string[],
  titles: string[],
  xLim: [number, number],
) =>
  ids.map((id, i): Plot => ({
    type: "line",
    title: titles[i],
    x: `${id}.t`,
    y: [
      { of: `${id}.A * 1000`, label: "A" },
      { of: `${id}.v_ATPsynth / 3 * 1000`, label: "v_ATP / 3" },
      { of: `${id}.v_FNR / 2 * 1000`, label: "v_NADPH / 2" },
    ],
    xLabel: "Time (s)",
    yLabel: "Flux (µmol m⁻² s⁻¹)",
    xLim,
  }));

export const validations: Validation[] = [
  {
    id: "fig3",
    title: "Figures 3 and 4: response to PPFD and Ca",
    scenarios: { ...pfd.scenarios, ...ca.scenarios },
    collect: {
      pfd: lastOf(pfd.ids, seq(pfd.ids.length), SCAN_COLUMNS),
      ca: lastOf(ca.ids, seq(ca.ids.length), SCAN_COLUMNS),
    },
    plots: [
      scanPlot("pfd", "pfd.A * 1000", "A (µmol m⁻² s⁻¹)"),
      scanPlot("ca", "ca.A * 1000", "A (µmol m⁻² s⁻¹)"),
      scanPlot("pfd", "pfd.gs", "gs (mol m⁻² s⁻¹)"),
      scanPlot("ca", "ca.gs", "gs (mol m⁻² s⁻¹)"),
      scanPlot("pfd", "pfd.RUBP * param.V_m * 1000", "RuBP (µmol m⁻²)"),
      scanPlot("ca", "ca.RUBP * param.V_m * 1000", "RuBP (µmol m⁻²)"),
      scanPlot("pfd", "pfd.Ract * pfd.f_rubp", "Rubisco rel. activity"),
      scanPlot("ca", "ca.Ract * ca.f_rubp", "Rubisco rel. activity"),
    ],
    golden: Object.fromEntries(
      ["pfd", "ca"].flatMap((t) =>
        SCAN_COLUMNS.map((c) => [`${t}_${c}`, { x: `${t}.x`, y: `${t}.${c}` }]),
      ),
    ),
  },
  {
    id: "fig5",
    title: "Figure 5: light transients",
    deriveEach: { t: `time - ${ACCLIMATION}` },
    scenarios: {
      up: {
        parameters: { Ca: 350, ...TRANSIENT_PARAMS },
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(ACCLIMATION, { PPFD: 50 }), step(1800, { PPFD: 1500 })],
        },
      },
      down: {
        parameters: { Ca: 350, ...TRANSIENT_PARAMS },
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(ACCLIMATION, { PPFD: 1500 }), step(1800, { PPFD: 50 })],
        },
      },
    },
    plots: transientPlots(
      ["up", "down"],
      ["50 to 1500", "1500 to 50"],
      [-100, 1600],
    ),
    golden: transientGolden(["up", "down"], TRANSIENT_COLUMNS),
  },
  {
    id: "fig6",
    title: "Figure 6: Ca transients",
    deriveEach: { t: `time - ${ACCLIMATION}` },
    scenarios: {
      up: {
        parameters: { PPFD: 1500, ...TRANSIENT_PARAMS },
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(ACCLIMATION, { Ca: 350 }), step(500, { Ca: 1500 })],
        },
      },
      down: {
        // The initial Ci follows Ca; the notebook's shared model is at 1500 here.
        parameters: { PPFD: 1500, Ca: 1500, ...TRANSIENT_PARAMS },
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(ACCLIMATION, { Ca: 1500 }), step(500, { Ca: 350 })],
        },
      },
    },
    plots: transientPlots(
      ["up", "down"],
      ["350 to 1500", "1500 to 350"],
      [-100, 300],
    ),
    golden: transientGolden(["up", "down"], TRANSIENT_COLUMNS),
  },
  {
    id: "fig7",
    title: "Figure 7: low oxygen",
    scenarios: {
      o2: {
        parameters: { PPFD: 300, Ca: 200, p_o2: 210000 },
        pre: [halfHour],
        simulate: {
          kind: "protocol",
          pointsPerStep: 1000,
          steps: [step(250, { p_o2: 210000 }), step(700, { p_o2: 20000 })],
        },
      },
    },
    plots: [
      {
        type: "line",
        x: "o2.time",
        y: [
          { of: "o2.A * 1000", label: "Modelled A" },
          { of: "o2.PhiPSII", label: "Modelled Y(II)", axis: "right" },
        ],
        xLabel: "Time (s)",
        yLabel: "Net assimilation (µmol m⁻² s⁻¹)",
        yRightLabel: "Y(II)",
        xLim: [0, 700],
        yLim: [5, 20],
        yRightLim: [0, 0.8],
        phases: [{ from: 250, to: 700 }],
      },
    ],
    golden: {
      A: { x: "o2.time", y: "o2.A" },
      PhiPSII: { x: "o2.time", y: "o2.PhiPSII" },
    },
  },
];
