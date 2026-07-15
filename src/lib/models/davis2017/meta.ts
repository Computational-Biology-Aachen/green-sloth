import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "davis2017",
  title: "Davis 2017, Philos Trans.",
  DOI: "10.1098/rstb.2016.0381",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "PQ Cycle",
      "Cytochrome b6f",
      "PC",
      "FNR",
      "PSI",
      "ATP Synthase",
      "Proton motive force (pmf)",
      "NPQ",
    ],
    "Model type": ["ODE"],
    "Explains data": ["PAM fluorescence", "ECS (P515)"],
    Organism: ["Generic C3 plant"],
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
      contributor: contributors.huynguyen,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
