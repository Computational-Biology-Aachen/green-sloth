import type { ModelMeta } from "$lib/types";

// Dissertation (Heinrich-Heine-Universität Düsseldorf, 2016) — no DOI assigned.
export const meta: ModelMeta = {
  slug: "matuszynska2016_phd",
  title: "Matuszynska 2016 (PhD)",
  DOI: "",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "ATP Synthase",
      "Cytochrome b6f",
      "PQ Cycle",
      "PC",
      "FNR",
      "PSI",
    ],
    Demonstrations: [],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
