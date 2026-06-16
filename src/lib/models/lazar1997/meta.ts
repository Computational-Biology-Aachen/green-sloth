import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "lazar1997",
  title: "Lazar 1997, Pestic. Biochem. Physiol.",
  DOI: "10.1006/pest.1997.2277",
  tags: {
    "Part of Photosynthesis": ["PSII"],
    Demonstrations: [],
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
