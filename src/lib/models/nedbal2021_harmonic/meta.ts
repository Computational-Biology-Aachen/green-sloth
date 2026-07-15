import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "nedbal2021_harmonic",
  title: "Nedbal 2021 (Harmonic)",
  DOI: "10.1093/plphys/kiab317",
  tags: {
    "Part of Photosynthesis": [],
    "Model type": ["ODE"],
    "Explains data": [],
    Organism: ["Chlorella sorokiniana"],
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
      contributor: contributors.tanvirhassan,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
