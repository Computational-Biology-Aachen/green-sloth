import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "davis2017",
  title: "Davis 2017",
  DOI: "https://doi.org/10.7554/eLife.16921",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "PQ Cycle",
      "Cytochrome b6f",
      "PC",
      "FNR",
      "PSI",
      "CBB Cycle",
      "ATP Synthase",
    ],
    Demonstrations: [],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
