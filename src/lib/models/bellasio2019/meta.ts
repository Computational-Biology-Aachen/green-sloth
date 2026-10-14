import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "bellasio2019",
  title: "Bellasio 2019",
  DOI: "10.1007/s11120-018-0601-1",
  journal: "Photosynth. Res.",
  license: "Recreated",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "Cytochrome b6f",
      "PQ Cycle",
      "ATP Synthase",
      "PSI",
      "CBB Cycle",
      "Photorespiration",
    ],
    "Model type": ["ODE"],
    "Explains data": ["Gas exchange", "Concentration changes"],
    Organism: ["Nicotiana tabacum", "Raphanus sativus", "Spinacia oleracea"],
    "PMF description": [],
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
