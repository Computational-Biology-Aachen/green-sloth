import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "bernacchi2003",
  title: "Bernacchi 2003",
  journal: "Plant Cell Environ.",
  license: "© Blackwell Publishing Ltd",
  DOI: "10.1046/j.0016-8025.2003.01050.x",
  tags: {
    "Part of Photosynthesis": ["CBB Cycle", "Photorespiration"],
    "Model type": ["Steady State"],
    "Explains data": ["Gas exchange", "PAM fluorescence"],
    Organism: ["Nicotiana tabacum"],
    "PMF description": [],
  },
  analyses: [
    {
      type: "sweep",
      title: "Leaf-temperature response of A",
      parameter: "T_leaf",
      min: 10,
      max: 40,
      steps: 121,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Wc", "Wj", "A", "A_acc"],
    },
    {
      type: "sweep",
      title: "Leaf-temperature response of Jmax and J",
      parameter: "T_leaf",
      min: 10,
      max: 40,
      steps: 121,
      yLabel: "J / µmol m⁻² s⁻¹",
      selectedKeys: ["Jmax", "J", "Jmax_acc", "J_acc"],
    },
    {
      type: "sweep",
      title: "Light response",
      parameter: "Q",
      min: 0,
      max: 2000,
      steps: 201,
      yMin: -5,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["A", "A_acc"],
    },
    {
      type: "sweep",
      title: "CO₂ response",
      parameter: "Ci",
      min: 50,
      max: 2000,
      steps: 196,
      yMin: -5,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Wc", "Wj", "A"],
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
