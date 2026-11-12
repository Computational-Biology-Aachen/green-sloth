import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "bernacchi2001",
  title: "Bernacchi 2001",
  journal: "Plant Cell Environ.",
  license: "© Wiley",
  DOI: "10.1111/j.1365-3040.2001.00668.x",
  tags: {
    "Part of Photosynthesis": ["CBB Cycle", "Photorespiration"],
    "Model type": ["Steady State"],
    "Explains data": ["Gas exchange"],
    Organism: ["Nicotiana tabacum"],
    "PMF description": [],
  },
  analyses: [
    {
      type: "sweep",
      title: "Leaf-temperature response",
      parameter: "T_leaf",
      min: 10,
      max: 40,
      steps: 100,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["A"],
    },
    {
      type: "sweep",
      title: "CO₂ response",
      parameter: "Ci",
      min: 10,
      max: 1000,
      steps: 100,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["A"],
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
