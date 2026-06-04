import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "matuszynska2019",
  title: "Matuszynska 2019",
  DOI: "https://doi.org/10.1111/ppl.12962",
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
    ],
    Demonstrations: [],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
