import type { ModelMeta } from "$lib/types";
import { defaultPamProtocol } from "$lib/models/pamProtocols";

export const meta: ModelMeta = {
  slug: "matuszynska2016_npq",
  title: "Matuszynska 2016",
  DOI: "https://doi.org/10.1016/j.bbabio.2016.09.003",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "ATP Synthase",
      "Cytochrome b6f",
      "PQ Cycle",
    ],
    Demonstrations: [
      "Day Simulation",
      "PAM Simulation",
      "Photosynthesis MCA",
      "Fitting of NPQ",
    ],
  },
  analyses: [
    { type: "timecourse", title: "Time course", tEnd: 100, nTimePoints: 500 },
    {
      type: "pam",
      title: "PAM fluorescence",
      ppfdKey: "PPFD",
      fluoKey: "Fluo",
      pamProtocol: defaultPamProtocol,
      showDerived: true,
      variables: ["Fluo"],
      normalizedKeys: ["Fluo"],
      nTimePoints: 100,
      timeoutInSeconds: 60,
    },
  ],
};
