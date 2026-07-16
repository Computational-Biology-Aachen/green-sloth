import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "johnson2021",
  title: "Johnson 2021",
  DOI: "10.1007/s11120-021-00840-4",
  license: "CC BY 4.0",
  journal: "Photosynth. Res.",
  tags: {
    "Part of Photosynthesis": ["PSII", "ATP Synthase", "Cytochrome b6f", "PQ Cycle",
                              "PC", "PSI", "CBB Cycle", "Photorespiration"],
    "Model type": ["Steady State"],
    "Explains data": ["Gas exchange"],
    Organism: ["Generic C3 plant"],
  },
  analyses: [
    {
      type: "sweep",
      parameter: "CO2",
      min: 50,
      max: 1000,
      steps: 100,
      // yMax: 60,
      yLabel: "Carbon fixation",
      selectedKeys: ["An_a"],
      // Variables span several orders of magnitude; auto-split them into
      // per-magnitude subplots so small-valued species stay readable.
      plot: { type: "magnitude" },
    },
  ],
  contributors: [
    {
      desc: "Initial implementation",
      date: new Date(2025, 6),
      contributor: contributors.joshaebeling,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
