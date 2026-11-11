import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "pfennig2024",
  title: "Pfennig 2024",
  journal: "PLoS Comput. Biol.",
  license: "© CC BY 4.0",
  DOI: "10.1371/journal.pcbi.1012445",
  tags: {
    "Part of Photosynthesis": [
      "PSII",
      "PQ Cycle",
      "Cytochrome b6f",
      "PC",
      "PSI",
      "FNR",
      "ATP Synthase",
      "CBB Cycle",
      "NPQ",
      "Photorespiration",
    ],
    "Model type": ["ODE"],
    "Explains data": ["PAM fluorescence"],
    Organism: ["Synechocystis sp. PCC 6803"],
    "PMF description": ["Only ΔpH"],
  },
  analyses: [
    {
      type: "timecourse",
      title: "Time course",
      tEnd: 300,
      nTimePoints: 500,
      variables: ["PQ_ox", "PC_ox", "Fd_ox", "NADPH", "ATP", "OCP"],
      plot: { type: "magnitude" },
    },
    {
      type: "timecourse",
      title: "Fluorescence and lumen pH",
      tEnd: 300,
      nTimePoints: 500,
      variables: ["Fluo", "pHlumen"],
      showDerived: true,
      plot: { type: "grid", groups: [["Fluo"], ["pHlumen"]] },
    },
  ],
  dataSelects: [
    {
      data: "light_spectrum",
      title: "Light source",
      default: "warm_white_led",
      options: [
        { key: "solar", label: "Solar" },
        { key: "fluorescent_lamp", label: "Fluorescent lamp" },
        { key: "cool_white_led", label: "Cool white LED" },
        { key: "warm_white_led", label: "Warm white LED" },
      ],
      load: () => import("./lights.json"),
      preview: { kind: "spectrum", xMin: 400, xMax: 700, unit: "nm" },
    },
  ],
  contributors: [
    {
      desc: "Initial implementation (generated from mxl-models)",
      date: new Date(2026, 10),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
