import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "li2021",
  title: "Li 2021",
  DOI: "https://doi.org/10.1038/s41477-021-00947-5",
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
    Demonstrations: ["PAM Simulation", "Fitting of NPQ"],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
