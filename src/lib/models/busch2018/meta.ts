import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "busch2018",
  title: "Busch, Sage & Farquhar 2018",
  journal: "Nat. Plants",
  license: "© Macmillan Publishers Limited, part of Springer Nature",
  DOI: "10.1038/s41477-017-0065-x",
  tags: {
    "Part of Photosynthesis": ["CBB Cycle", "Photorespiration"],
    "Model type": ["Steady State"],
    "Explains data": ["Gas exchange"],
    Organism: ["Helianthus annuus"],
    "PMF description": [],
  },
  analyses: [
    {
      type: "sweep",
      title: "CO₂ response",
      parameter: "C",
      min: 5,
      max: 200,
      steps: 196,
      yMin: 0,
      yMax: 45,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Ac", "Aj", "Ap", "A"],
    },
    {
      type: "sweep",
      title: "Photorespiratory N assimilation",
      parameter: "C",
      min: 5,
      max: 200,
      steps: 196,
      yMin: 0,
      yMax: 1.4,
      yLabel: "N / µmol m⁻² s⁻¹",
      selectedKeys: ["N_G", "N_S", "N_total"],
    },
    {
      type: "sweep",
      title: "O₂ response",
      parameter: "O",
      min: 0.2,
      max: 40,
      steps: 200,
      yMin: 0,
      yMax: 45,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["Ac", "Aj", "Ap", "A"],
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
