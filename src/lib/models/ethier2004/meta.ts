import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "ethier2004",
  title: "Ethier 2004",
  journal: "Plant Cell Environ.",
  license: "© Wiley",
  DOI: "10.1111/j.1365-3040.2004.01140.x",
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
      title: "CO₂ response",
      parameter: "Ci",
      min: 0,
      max: 1600,
      steps: 161,
      yMin: -5,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["An", "Ac", "Aj", "An_inf"],
    },
    {
      type: "sweep",
      title: "Transfer conductance",
      parameter: "gi",
      min: 0.02,
      max: 1,
      steps: 99,
      yMin: 0,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["An", "An_inf"],
    },
    {
      type: "sweep",
      title: "Chloroplastic CO₂",
      parameter: "gi",
      min: 0.02,
      max: 1,
      steps: 99,
      yMin: 0,
      yLabel: "Cc / µbar",
      selectedKeys: ["Cc"],
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
