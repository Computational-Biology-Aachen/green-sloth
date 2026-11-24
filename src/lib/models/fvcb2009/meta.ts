import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "fvcb2009",
  title: "von Caemmerer 2009",
  journal: "Photosynthesis in silico",
  license: "© Springer",
  DOI: "10.1007/978-1-4020-9237-4_9",
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
      title: "CO₂ response",
      parameter: "Ci",
      min: 0,
      max: 1600,
      steps: 161,
      yMin: -5,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["A", "Ac", "Aj", "A_inf"],
    },
    {
      type: "sweep",
      title: "Light response",
      parameter: "I",
      min: 0,
      max: 2000,
      steps: 101,
      yMin: -2,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["A", "Ac", "Aj"],
    },
    {
      type: "sweep",
      title: "Temperature response",
      parameter: "t_leaf",
      min: 0,
      max: 45,
      steps: 91,
      yLabel: "A / µmol m⁻² s⁻¹",
      selectedKeys: ["A", "Ac", "Aj"],
    },
    {
      type: "sweep",
      title: "Maximum electron transport rate",
      parameter: "t_leaf",
      min: 0,
      max: 50,
      steps: 101,
      yMin: 0,
      yLabel: "Jmax / µmol m⁻² s⁻¹",
      selectedKeys: ["Jmax"],
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
