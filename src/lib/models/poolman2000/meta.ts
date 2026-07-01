import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "poolman2000",
  title: "Poolman 2000, Exp. Botany",
  DOI: "10.1093/jexbot/51.suppl_1.319",
  tags: {
    "Part of Photosynthesis": [],
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
};
