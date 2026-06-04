import type { ModelMeta } from "$lib/types";

// No code-gen yet — model.ts pending. Listed for tag/filter purposes only.
export const meta: ModelMeta = {
  slug: "fuente2024",
  title: "Fuente 2024",
  DOI: "https://doi.org/10.1016/j.plaphy.2024.109138",
  tags: {
    "Part of Photosynthesis": [
      "OEC",
      "PQ Cycle",
      "PSII",
      "PSI",
      "ATP Synthase",
    ],
    Demonstrations: [
      "Day Simulation",
      "PAM Simulation",
      "Photosynthesis MCA",
      "Fitting of NPQ",
    ],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
