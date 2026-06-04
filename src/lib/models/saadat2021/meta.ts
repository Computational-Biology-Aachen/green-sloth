import type { ModelMeta } from "$lib/types";
import { defaultPamProtocol } from "$lib/models/pamProtocols";

export const meta: ModelMeta = {
  slug: "saadat2021",
  title: "Saadat 2021",
  DOI: "https://doi.org/10.3389/fpls.2021.750580",
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
    Demonstrations: [
      "Day Simulation",
      "FvCB Addon",
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
      pamProtocol: defaultPamProtocol,
      showDerived: true,
      variables: ["GAP", "atp"],
      normalizedKeys: ["GAP", "atp"],
      nTimePoints: 100,
      timeoutInSeconds: 120,
    },
  ],
};
