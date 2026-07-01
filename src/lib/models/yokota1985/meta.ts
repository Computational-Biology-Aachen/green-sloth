import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "yokota1985",
  title: "Yokota 1985, Agr. BioChem",
  DOI: "10.1080/00021369.1985.10867259",
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
