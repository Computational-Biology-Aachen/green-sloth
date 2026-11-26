import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "kumarathunge2019",
  title: "Kumarathunge 2019",
  journal: "New Phytol.",
  license: "© New Phytologist Trust",
  DOI: "10.1111/nph.15668",
  tags: {
    "Part of Photosynthesis": ["CBB Cycle", "Photorespiration"],
    "Model type": ["Steady State"],
    "Explains data": ["Gas exchange"],
    Organism: ["Generic C3 plant"],
    "PMF description": [],
  },
  analyses: [
    {
      type: "sweep",
      title: "Leaf-temperature response of Anet at Ci = 275",
      parameter: "T_leaf",
      min: 5,
      max: 45,
      steps: 161,
      yMin: -5,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Ac", "Aj", "A_net"],
    },
    {
      type: "sweep",
      title: "Leaf-temperature response of Vcmax and Jmax",
      parameter: "T_leaf",
      min: 5,
      max: 45,
      steps: 161,
      yLabel: "Rate / µmol m⁻² s⁻¹",
      selectedKeys: ["Vcmax", "Jmax", "J"],
    },
    {
      type: "sweep",
      title: "Acclimation: optimum temperatures against growth temperature",
      parameter: "T_growth",
      min: 0,
      max: 35,
      steps: 71,
      yLabel: "Topt / °C",
      selectedKeys: ["ToptV", "ToptJ"],
    },
    {
      type: "sweep",
      title: "CO₂ response",
      parameter: "Ci",
      min: 100,
      max: 1500,
      steps: 141,
      yMin: -5,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Ac", "Aj", "A_net"],
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
