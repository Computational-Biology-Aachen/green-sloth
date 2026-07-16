import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "hahn1987",
  title: "Hahn 1987",
  journal: "Ann. Bot.",
  DOI: "10.1093/oxfordjournals.aob.a087432",
  tags: {
    "Part of Photosynthesis": ["CBB Cycle","Photorespiration"],
    "Model type": ["ODE"],
    "Explains data": ["Concentration changes"],
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
      contributor: contributors.timnies,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
