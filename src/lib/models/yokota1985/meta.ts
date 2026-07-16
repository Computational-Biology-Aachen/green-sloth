import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "yokota1985",
  title: "Yokota 1985",
  journal: "Planta",
  DOI: "10.1007/BF00392212",
  tags: {
    "Part of Photosynthesis": ["Photorespiration"],
    "Model type": ["ODE"],
    "Explains data": [],
    Organism: ["Generic C3 plant", "Euglena gracilis"],
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
