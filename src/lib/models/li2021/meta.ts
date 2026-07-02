import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "li2021",
  title: "Li 2021, Nat. Plants",
  DOI: "10.1038/s41477-021-00947-5",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "ATP Synthase",
      "Cytochrome b6f",
      "PQ Cycle",
      "PC",
      "FNR",
      "PSI",
      "CBB Cycle",
      "OEC",
    ],
    "Model type": ["ODE"],
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
      contributor: contributors.elouencorvest,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
