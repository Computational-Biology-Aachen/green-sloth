import contributors from "$lib/contributors";
import { defaultPamProtocol } from "$lib/models/pamProtocols";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "saadat2021",
  title: "Saadat 2021",
  journal: "Front. Plant Sci.",
  license: "CC BY 4.0",
  DOI: "10.3389/fpls.2021.750580",
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
    "Model type": ["ODE"],
    "Explains data": ["PAM fluorescence", "P700 absorbance"],
    Organism: ["Arabidopsis thaliana"],
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
      pamProtocol: defaultPamProtocol,
      showDerived: true,
      variables: ["GAP", "atp"],
      normalizedKeys: ["GAP", "atp"],
      nTimePoints: 100,
      timeoutInSeconds: 120,
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
