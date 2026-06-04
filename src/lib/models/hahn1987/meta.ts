import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "hahn1987",
  title: "Hahn 1987",
  DOI: "https://doi.org/10.1093/oxfordjournals.aob.a087432",
  tags: {
    "Part of Photosynthesis": ["CBB Cycle"],
    Demonstrations: [],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
