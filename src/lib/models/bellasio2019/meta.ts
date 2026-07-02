import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "bellasio2019",
  title: "Bellasio 2019, Photosynth. Res.",
  DOI: "10.1007/s11120-018-0601-1",
  tags: {
    "Part of Photosynthesis": ["PSII", "CBB Cycle", "ATP Synthase", "FNR"],
    "Model type": ["ODE"],
  },
  analyses: [
    {
      type: "timecourse",
      tEnd: 100,
      nTimePoints: 500,
      // Ci is ~an order of magnitude larger than the other variables, so it
      // gets its own subplot; everything else shares the second one.
      plot: { type: "grid", groups: [["Ci"]] },
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
