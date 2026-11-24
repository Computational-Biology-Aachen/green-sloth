import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "bernacchi2002",
  title: "Bernacchi 2002",
  journal: "Plant Physiol.",
  license: "© American Society of Plant Biologists",
  DOI: "10.1104/pp.008250",
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
      title: "Leaf-temperature response of gm",
      parameter: "T_leaf",
      min: 5,
      max: 45,
      steps: 161,
      yLabel: "gm / mol m⁻² s⁻¹ bar⁻¹",
      selectedKeys: ["gm"],
    },
    {
      type: "sweep",
      title: "Leaf-temperature response of A",
      parameter: "T_leaf",
      min: 5,
      max: 45,
      steps: 161,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["A", "A_inf"],
    },
    {
      type: "sweep",
      title: "CO₂ response",
      parameter: "Ci",
      min: 10,
      max: 1600,
      steps: 160,
      yMin: -5,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["A", "A_inf"],
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
