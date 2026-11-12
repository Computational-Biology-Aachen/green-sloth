import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "bernacchi2013",
  title: "Bernacchi 2013",
  journal: "Plant Cell Environ.",
  license: "© Wiley",
  DOI: "10.1111/pce.12118",
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
      min: 50,
      max: 1000,
      steps: 100,
      yMax: 60,
      yLabel: "Carbon fixation",
      selectedKeys: ["rubisco", "rubp", "tpu", "an"],
    },
    {
      type: "sweep",
      title: "Leaf-temperature response",
      parameter: "T_leaf",
      min: 5,
      max: 40,
      steps: 100,
      yMin: 0,
      yMax: 40,
      yLabel: "Carbon fixation",
      selectedKeys: ["rubisco", "rubp", "tpu", "an"],
    },
  ],
  contributors: [
    {
      desc: "Initial implementation",
      date: new Date(2025, 6),
      contributor: contributors.tanvirhassan,
    },
    {
      desc: "Maintenance",
      date: new Date(2026, 6),
      contributor: contributors.marvinvanaalst,
    },
    {
      desc: "Leaf-temperature responses and validation figures",
      date: new Date(2026, 10),
      contributor: contributors.marvinvanaalst,
    },
  ],
};
