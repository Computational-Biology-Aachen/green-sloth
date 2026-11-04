import { linspace } from "#lib/validation/helpers.js";
import type { GoldenSeries, Scan, Validation } from "#lib/validation/types.js";
import lights from "./lights.json";

/**
 * Relative spectra over the model's 400–700 nm `wavelength` (Fuente 2021),
 * each integrating to 1; the parameter `PPFD` sets their intensity.
 */
const LIGHTS = [
  "solar",
  "fluorescent_lamp",
  "cool_white_led",
  "warm_white_led",
] as const;
const PFD = linspace(20, 500, 13);

// As the notebook: per light source, run 10 000 s per intensity and keep the
// final CCM flux.
const scans: Record<string, Scan> = Object.fromEntries(
  LIGHTS.map((light): [string, Scan] => [
    light,
    {
      over: { PPFD: PFD },
      edits: [{ setData: "light_spectrum", to: `data.${light}` }],
      columns: ["vCCM"],
      simulate: { kind: "timeCourse", tEval: linspace(0, 10_000, 100) },
    },
  ]),
);

export const validations: Validation[] = [
  {
    id: "fig4e",
    title: "Figure 4E: carbon uptake under common light sources",
    data: Object.fromEntries(LIGHTS.map((light) => [light, lights[light]])),
    scans,
    plots: [
      {
        type: "line",
        x: `${LIGHTS[0]}.x`,
        y: LIGHTS.map((light) => ({
          of: `${light}.vCCM`,
          x: `${light}.x`,
          label: light,
        })),
        xLabel: "Light intensity / µmol Photons m⁻² s⁻¹",
        yLabel: "Flux / mmol g(Chl)⁻¹ min⁻¹",
        xTicks: linspace(20, 500, 7),
        legend: true,
      },
    ],
    golden: Object.fromEntries(
      LIGHTS.map((light): [string, GoldenSeries] => [
        light,
        { x: `${light}.x`, y: `${light}.vCCM` },
      ]),
    ),
  },
];
