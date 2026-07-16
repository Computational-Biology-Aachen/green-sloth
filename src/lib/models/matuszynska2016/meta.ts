import contributors from "$lib/contributors";
import { defaultPamProtocol } from "$lib/models/pamProtocols";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "matuszynska2016",
  title: "Matuszynska 2016",
  journal: "BBA Bioenerg.",
  license: "CC BY 4.0",
  DOI: "10.1016/j.bbabio.2016.09.003",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "ATP Synthase",
      "Cytochrome b6f",
      "PQ Cycle",
    ],
    "Model type": ["ODE"],
    "Explains data": ["PAM fluorescence"],
    Organism: ["Arabidopsis thaliana", "Epipremnum aureum"],
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
      contributor: contributors.marvinvanaalst,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
