import contributors from "$lib/contributors";
import { defaultPamProtocol } from "$lib/models/pamProtocols";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "ebenhoeh2014",
  title: "Ebenhöh 2014",
  journal: "Philos Trans.",
  DOI: "10.1098/rstb.2013.0223",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "ATP Synthase",
      "Cytochrome b6f",
      "PQ Cycle",
      "PSI",
      "PC",
      "FNR",
    ],
    "Model type": ["ODE"],
    "Explains data": ["PAM fluorescence"],
    Organism: ["Chlamydomonas reinhardtii"],
  },
  analyses: [
    {
      type: "timecourse",
      title: "Time course",
      tEnd: 100,
      nTimePoints: 500,
      // Variables span several orders of magnitude; auto-split them into
      // per-magnitude subplots so small-valued species stay readable.
      plot: { type: "magnitude" },
    },
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
  contributors: [
    {
      desc: "Initial implementation",
      date: new Date(2026, 5),
      contributor: contributors.elouencorvest,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.majablume,
    },
  ],
};
