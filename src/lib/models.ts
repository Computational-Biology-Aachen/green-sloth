import { buildableSlugs } from "./modelSlugs";
import type { ModelMeta } from "./types";

// Auto-discover models from their co-located files. A model is only listed when
// it has BOTH a meta.ts and a loadable model file (`model.mxl.json`, `model.sbml`
// or `model.ts` — see `loadModel`). Drop a new `models/<slug>/` folder with both
// and it registers itself; no edit needed here.
const metaModules = import.meta.glob<{ meta: ModelMeta }>(
  "./models/*/meta.ts",
  { eager: true },
);

export const models: Record<string, ModelMeta> = Object.fromEntries(
  Object.values(metaModules)
    .map((m) => m.meta)
    .filter((meta) => buildableSlugs.has(meta.slug))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((meta) => [meta.slug, meta]),
);

export const modelNames = Object.keys(models);
