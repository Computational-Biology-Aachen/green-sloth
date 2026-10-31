import { defaultGrid } from "#lib/validation/helpers.js";
import type { Validation } from "#lib/validation/types.js";

const columns = ["glycolate", "glyoxylate", "glycine", "serine"];

export const validations: Validation[] = [
  {
    id: "fig6a",
    title: "Figure 6a: time course from empty pools",
    simulate: { kind: "timeCourse", tEval: defaultGrid(1e-1) },
    scenarios: {
      empty: {
        initial: {
          glycolate: 0,
          glyoxylate: 0,
          glycine: 0,
          serine: 0,
          hydroxypyruvate: 0,
          H2O2: 0,
        },
      },
    },
    plots: [
      {
        type: "line",
        x: "empty.time",
        y: columns.map((c) => ({ of: `empty.${c}`, label: c })),
        xLabel: "Time (h)",
        yLabel: "Concentration (µmol mg⁻¹ Chl h⁻¹)",
      },
    ],
    golden: Object.fromEntries(
      columns.map((c) => [c, { x: "empty.time", y: `empty.${c}` }]),
    ),
  },
];
