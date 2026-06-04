import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "bellasio2019",
  title: "Bellasio 2019",
  DOI: "https://doi.org/10.1007/s11120-018-0601-1",
  tags: {
    "Part of Photosynthesis": ["PSII", "CBB Cycle", "ATP Synthase", "FNR"],
    Demonstrations: ["Day Simulation", "FvCB Addon", "Photosynthesis MCA"],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
