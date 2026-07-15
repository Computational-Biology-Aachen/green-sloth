import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

// No code-gen yet — model.ts pending. Listed for tag/filter purposes only.
export const meta: ModelMeta = {
  slug: "fuente2024",
  title: "Fuente 2024, Plant Physiol. Biochem.",
  DOI: "10.1016/j.plaphy.2024.109138",
  tags: {
    "Part of Photosynthesis": [
      "OEC",
      "PQ Cycle",
      "PSII",
      "PSI",
      "ATP Synthase",
    ],
    "Model type": ["ODE"],
    "Explains data": [],
    Organism: ["Chlamydomonas reinhardtii"],
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
      contributor: contributors.elouencorvest,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
