import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: "evans2013",
  title: "Evans 2013",
  journal: "Plant Cell Environ.",
  license: "© Blackwell Publishing Ltd",
  DOI: "10.1111/j.1365-3040.2012.02591.x",
  tags: {
    "Part of Photosynthesis": [],
    "Model type": ["Steady State"],
    "Explains data": ["Gas exchange"],
    Organism: ["Nicotiana tabacum"],
    "PMF description": [],
  },
  analyses: [
    {
      type: "sweep",
      title:
        "Leaf-temperature response of the liquid and membrane conductances",
      parameter: "T_leaf",
      min: 5,
      max: 45,
      steps: 161,
      yLabel: "g / mol m⁻² s⁻¹ bar⁻¹",
      selectedKeys: ["g_liq", "g_mem", "gm"],
    },
    {
      type: "sweep",
      title: "Leaf-temperature response of gm: modelled and measured (linear)",
      parameter: "T_leaf",
      min: 5,
      max: 45,
      steps: 161,
      yLabel: "gm / mol m⁻² s⁻¹ bar⁻¹",
      selectedKeys: ["gm", "gm_lin"],
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
