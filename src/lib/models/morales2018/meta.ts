import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "morales2018",
  title: "Morales 2018",
  journal: "Plant Cell Environ.",
  license: "CC BY 4.0",
  DOI: "10.1111/pce.13119",
  tags: {
    "Part of Photosynthesis": ["PSII", "NPQ", "CBB Cycle", "Photorespiration"],
    "Model type": ["ODE"],
    "Explains data": ["Gas exchange", "PAM fluorescence"],
    Organism: ["Arabidopsis thaliana"],
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
      contributor: contributors.malickcisse,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
