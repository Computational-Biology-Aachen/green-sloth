import { linspace, repeat, step } from "#lib/validation/helpers.js";
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
    columns: 1,
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
        title: "light-induced state transitions",
        x: "normal.time",
        y: [
          {
            of: "normal.Fluo / max(normal.Fluo)",
            label: "Simulation",
            color: "#a7a9ac",
            lineWidth: 0.8,
          },
        ],
        yLabel: "fluorescence",
        xLim: [0, 1800],
        xTicks: linspace(0, 1800, 10),
        yLim: [0, 1],
        yTicks: linspace(0, 1, 6),
        legend: false,
      },
      {
        type: "line",
        title: "anoxia-induced state transitions",
        x: "anoxia.time",
        y: [
          {
            of: "anoxia.Fluo / max(anoxia.Fluo)",
            label: "Simulation",
            color: "#a7a9ac",
            lineWidth: 0.8,
          },
        ],
        xLabel: "time, s",
        yLabel: "fluorescence",
        xLim: [0, 3200],
        xTicks: linspace(0, 3000, 7),
        yLim: [0, 1],
        yTicks: linspace(0, 1, 6),
        legend: false,
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
        // The notebook draws a 3D surface (rainbow, both axes inverted); a
        // heatmap of the same grid stands in for it.
        type: "heatmap",
        title: "steady-state PQ redox state",
        colormap: "rainbow",
        xLabel: "light intensity",
        yLabel: "relative antenna cross section of PSII",
        rows: cross.map((v) => String(+v.toFixed(2))),
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
