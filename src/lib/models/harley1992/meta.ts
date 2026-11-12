import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "harley1992",
  title: "Harley 1992",
  journal: "Plant Cell Environ.",
  license: "© Wiley",
  DOI: "10.1111/j.1365-3040.1992.tb00974.x",
  tags: {
    "Part of Photosynthesis": ["CBB Cycle", "Photorespiration"],
    "Model type": ["Steady State"],
    "Explains data": ["Gas exchange"],
    Organism: ["Gossypium hirsutum"],
    "PMF description": [],
  },
  analyses: [
    {
      type: "sweep",
      title: "CO₂ response",
      parameter: "Ci",
      min: 1,
      max: 100,
      steps: 100,
      yMin: -5,
      yMax: 45,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["rubisco", "rubp", "tpu", "A"],
    },
    {
      type: "sweep",
      title: "Leaf-temperature response",
      parameter: "T_leaf",
      min: 10,
      max: 40,
      steps: 100,
      yMin: 0,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["rubisco", "rubp", "tpu", "A"],
    },
    {
      type: "sweep",
      title: "Stomatal conductance",
      parameter: "Ci",
      min: 5,
      max: 100,
      steps: 100,
      yMin: 0,
      yLabel: "gs / mmol m⁻² s⁻¹",
      selectedKeys: ["gs"],
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
