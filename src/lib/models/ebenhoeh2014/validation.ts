import { repeat, step } from "#lib/validation/helpers.js";
import type { Scenario, Validation } from "#lib/validation/types.js";

const FLASH = 0.8;
const FLASH_PPFD = 5e4;

const cycle = (period: number, ppfd: number, n: number, extra = {}) =>
  repeat(
    [
      step(FLASH, { PPFD: FLASH_PPFD, ...extra }),
      step(period - FLASH, { PPFD: ppfd, ...extra }),
    ],
    n,
  );

const dark: Scenario = {
  parameters: { PPFD: 0 },
  pre: [{ kind: "steadyState" }],
};

// O2_dissolved_lumen's value in model.ts.
const O2 = 8;

const cross = Array.from({ length: 20 }, (_, i) => i * 0.05);
const light = Array.from({ length: 20 }, (_, i) => i * 25);

export const validations: Validation[] = [
  {
    id: "fig2",
    title: "Figure 2: state transitions",
    rtol: 1e-8,
    atol: 1e-8,
    scenarios: {
      normal: {
        ...dark,
        simulate: {
          kind: "protocol",
          pointsPerStep: 40,
          steps: [
            ...cycle(90, 0, 3),
            ...cycle(90, 100, 6),
            ...cycle(90, 0, 16),
          ],
        },
      },
      anoxia: {
        ...dark,
        simulate: {
          kind: "protocol",
          pointsPerStep: 100,
          steps: [
            ...cycle(120, 0, 3, { O2_dissolved_lumen: O2 }),
            ...cycle(120, 0, 11, { O2_dissolved_lumen: 0 }),
            ...cycle(120, 0, 13, { O2_dissolved_lumen: O2 }),
          ],
        },
      },
    },
    plots: [
      {
        type: "line",
        title: "Light-induced state transitions",
        x: "normal.time",
        y: [{ of: "normal.Fluo / max(normal.Fluo)", label: "Simulation" }],
        xLabel: "Time (s)",
        yLabel: "Fluorescence",
        xLim: [0, 1800],
        yLim: [0, 1],
      },
      {
        type: "line",
        title: "Anoxia-induced state transitions",
        x: "anoxia.time",
        y: [{ of: "anoxia.Fluo / max(anoxia.Fluo)", label: "Simulation" }],
        xLabel: "Time (s)",
        yLabel: "Fluorescence",
        xLim: [0, 3200],
        yLim: [0, 1],
      },
    ],
    golden: {
      normal: { x: "normal.time", y: "normal.Fluo" },
      anoxia: { x: "anoxia.time", y: "anoxia.Fluo" },
    },
  },
  {
    id: "fig3",
    title: "Figure 3: steady-state PQ redox state",
    rtol: 1e-8,
    atol: 1e-8,
    simulate: { kind: "steadyState" },
    scans: {
      surface: {
        over: { steady_cross_section: cross, PPFD: light },
        grid: true,
        x: Array.from({ length: cross.length * light.length }, (_, i) => i),
        edits: [
          { addParameter: "steady_cross_section", value: 0 },
          { setAssignment: "PSII_cross_section", to: "steady_cross_section" },
        ],
        columns: ["Plastoquinone_reduced"],
      },
    },
    plots: [
      {
        type: "heatmap",
        title: "Fraction of reduced PQ",
        rows: cross.map(String),
        columns: light.map(String),
        z: cross.map((_, r) =>
          light.map(
            (__, c) =>
              `nth(surface.Plastoquinone_reduced, ${r * light.length + c}) / param.PQ_tot`,
          ),
        ),
      },
    ],
    golden: {
      pqRed: {
        x: "surface.x",
        y: "surface.Plastoquinone_reduced / param.PQ_tot",
      },
    },
  },
];
