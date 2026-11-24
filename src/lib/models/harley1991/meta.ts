import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "harley1991",
  title: "Harley & Sharkey 1991",
  journal: "Photosynth. Res.",
  license: "© Kluwer Academic Publishers",
  DOI: "10.1007/BF00035838",
  tags: {
    "Part of Photosynthesis": ["CBB Cycle", "Photorespiration"],
    "Model type": ["Steady State"],
    "Explains data": ["Gas exchange"],
    Organism: ["Glycine max", "Gossypium hirsutum"],
    "PMF description": [],
  },
  analyses: [
    {
      type: "sweep",
      title: "CO₂ response",
      parameter: "Ci",
      min: 20,
      max: 1000,
      steps: 197,
      yMin: -5,
      yMax: 45,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Ac", "Aj", "Ap", "A"],
    },
    {
      type: "sweep",
      title: "O₂ response at high CO₂",
      parameter: "O",
      min: 10,
      max: 500,
      steps: 99,
      yMin: 0,
      yMax: 45,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Ac", "Aj", "Ap", "A"],
    },
    {
      type: "sweep",
      title: "Light response",
      parameter: "PPFD",
      min: 0,
      max: 2000,
      steps: 101,
      yMin: 0,
      yMax: 45,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Aj", "Ap", "A"],
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
