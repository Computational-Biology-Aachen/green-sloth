import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "fvcb1980",
  title: "FvCB 1980",
  DOI: "FIXME",
  tags: {
    "Part of Photosynthesis": [],
    "Model type": ["Steady State"],
  },
  analyses: [
    {
      type: "sweep",
      parameter: "Ci",
      min: 50,
      max: 1000,
      steps: 100,
      yMax: 60,
      yLabel: "Carbon fixation",
      selectedKeys: ["an", "wc", "wj", "wp"],
      // Variables span several orders of magnitude; auto-split them into
      // per-magnitude subplots so small-valued species stay readable.
      plot: { type: "magnitude" },
    },
  ],
  contributors: [
    {
      desc: "Initial implementation",
      date: new Date(2026, 6),
      contributor: contributors.elouencorvest,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
