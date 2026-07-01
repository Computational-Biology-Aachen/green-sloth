import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "nedbal2021harmonic",
  title: "Nedbal 2021 (Harmonic)",
  DOI: "fixme",
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
