import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

// Dissertation (Heinrich-Heine-Universität Düsseldorf, 2016) — no DOI assigned.
export const meta: ModelMeta = {
  slug: "matuszynska2016_phd",
  title: "Matuszynska 2016 (PhD Thesis)",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "ATP Synthase",
      "Cytochrome b6f",
      "PQ Cycle",
      "PC",
      "FNR",
      "PSI",
    ],
    "Model type": ["ODE"],
  },
  analyses: [
    {
      type: "timecourse",
      tEnd: 100,
      nTimePoints: 500,
      // Variables span several orders of magnitude; auto-split them into
      // per-magnitude subplots so small-valued species stay readable.
      plot: { type: "magnitude" },
    },
  ],
  contributors: [
    {
      desc: "Initial implementation",
      date: new Date(2026, 5),
      contributor: contributors.marvinvanaalst,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
