import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "gu2023",
  title: "Gu 2023",
  DOI: "/10.1111/pce.14563",
  license: "CC BY-NC 4.0",
  journal: "Plant, Cell & Environment",
  tags: {
    "Part of Photosynthesis": ["PSII", "PQ Cycle", "Cytochrome b6f"],
    "Model type": ["Steady State"],
    "Explains data": ["PAM fluorescence"],
    Organism: ["Generic C3 plant"],
  },
  analyses: [
    {
      type: "sweep",
      parameter: "q",
      min: 0,
      max: 1,
      steps: 100,
      yLabel: "hcyt",
      selectedKeys: ["h_cyt"],
      plot: { type: "magnitude" },
    },
  ],
  contributors: [
    {
      desc: "Initial implementation",
      date: new Date(2026, 7),
      contributor: contributors.annamatuszynska,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
