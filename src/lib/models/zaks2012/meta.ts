import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "zaks2012",
  title: "Zaks 2012",
  DOI: "10.1073/pnas.1211017109",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "PQ Cycle",
      "Cytochrome b6f",
      "PC",
      "PSI",
      "ATP Synthase",
    ],
    "Model type": ["ODE"],
    "Explains data": ["PAM fluorescence", "P700 absorbance", "ECS (P515)"],
    Organism: ["Arabidopsis thaliana"],
  },
  analyses: [
    {
      type: "timecourse",
      title: "Time course",
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
      contributor: contributors.huynguyen,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
