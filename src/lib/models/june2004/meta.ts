import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "june2004",
  title: "June 2004",
  journal: "Funct. Plant Biol.",
  license: "© CSIRO",
  DOI: "10.1071/FP03250",
  tags: {
    "Part of Photosynthesis": ["PSII"],
    "Model type": ["Steady State"],
    "Explains data": ["PAM fluorescence"],
    Organism: ["Glycine max"],
    "PMF description": [],
  },
  analyses: [
    {
      type: "sweep",
      title: "Electron transport",
      parameter: "T_leaf",
      min: 0,
      max: 50,
      steps: 100,
      yMin: 0,
      yLabel: "J / µmol e⁻ m⁻² s⁻¹",
      selectedKeys: ["J"],
    },
    {
      type: "sweep",
      title: "Relative to 25 °C",
      parameter: "T_leaf",
      min: 0,
      max: 50,
      steps: 100,
      yMin: 0,
      yLabel: "J / J(25 °C)",
      selectedKeys: ["J_rel25"],
    },
  ],
  contributors: [
    {
      desc: "Initial implementation and validation figures",
      date: new Date(2026, 10),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
