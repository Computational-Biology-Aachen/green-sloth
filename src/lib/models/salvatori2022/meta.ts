import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "salvatori2022",
  title: "Salvatori 2022",
  DOI: "10.3389/fpls.2021.787877",
  tags: {
    "Part of Photosynthesis": ["PSII", "CBB Cycle"],
    Demonstrations: [],
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
};
