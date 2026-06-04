import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "lazar1997",
  title: "Lazar 1997",
  DOI: "https://doi.org/10.1006/pest.1997.2243",
  tags: {
    "Part of Photosynthesis": ["PSII"],
    Demonstrations: [],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
