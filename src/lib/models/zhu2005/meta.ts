import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "zhu2005",
  title: "Zhu 2005, Planta",
  DOI: "10.1007/s00425-005-0064-4",
  tags: {
    "Part of Photosynthesis": ["PSII"],
    "Model type": ["ODE"],
    "Explains data": ["OJIP transient"],
    Organism: ["Theoretical"],
  },
  analyses: [
    {
      type: "timecourse",
      title: "Time course",
      tEnd: 1.0,
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
