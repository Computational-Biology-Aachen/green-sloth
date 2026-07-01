/**
 * Code-first model loading. A model folder under `src/lib/models/<slug>/` can
 * ship its model as data or code; we load the first format available, preferring
 * code over data:
 *
 *   1. `model.ts`       — hand-written builder, the authoring source
 *   2. `model.mxl.json` — canonical mxl-schemas format (committed, generated from
 *      `model.ts` via `npm run generate:mxl`). The format the app normally loads.
 *   3. `model.sbml`     — SBML, for models contributed in the field standard.
 *
 * The globs are eager so a model builds synchronously at call sites (prerender
 * and client alike), matching the previous `model.ts`-only loading.
 */
import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import { mxlJsonToModel } from "@computational-biology-aachen/mxlweb-core/mxl";
import { sbmlToModel } from "@computational-biology-aachen/mxlweb-core/sbml";

const jsonModules = import.meta.glob("$lib/models/*/model.mxl.json", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const sbmlModules = import.meta.glob("$lib/models/*/model.sbml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const tsModules = import.meta.glob("$lib/models/*/model.ts", {
  eager: true,
}) as Record<string, { initModel: () => KineticModelBuilder }>;

const slugOf = (path: string): string | undefined =>
  path.match(/\/models\/([^/]+)\//)?.[1];

function indexBySlug<T>(modules: Record<string, T>): Map<string, T> {
  const out = new Map<string, T>();
  for (const [path, mod] of Object.entries(modules)) {
    const slug = slugOf(path);
    if (slug !== undefined) out.set(slug, mod);
  }
  return out;
}

const jsonBySlug = indexBySlug(jsonModules);
const sbmlBySlug = indexBySlug(sbmlModules);
const tsBySlug = indexBySlug(tsModules);

/** Slugs that ship at least one loadable model format. */
export const buildableSlugs: ReadonlySet<string> = new Set([
  ...jsonBySlug.keys(),
  ...sbmlBySlug.keys(),
  ...tsBySlug.keys(),
]);

/** Greensloth only renders kinetic models; assert rather than silently mis-handle others. */
function asKinetic(model: unknown, slug: string): KineticModelBuilder {
  if (!(model instanceof KineticModelBuilder)) {
    throw new Error(`model "${slug}" is not a kinetic model`);
  }
  return model;
}

/**
 * Build a model's {@link KineticModelBuilder}, preferring code over data formats.
 * Returns `null` for an unknown slug (no model file in any format).
 */
export function buildModel(slug: string): KineticModelBuilder | null {
  const ts = tsBySlug.get(slug);
  if (ts !== undefined) return ts.initModel();

  const json = jsonBySlug.get(slug);
  if (json !== undefined) return asKinetic(mxlJsonToModel(json), slug);

  const sbml = sbmlBySlug.get(slug);
  if (sbml !== undefined) return asKinetic(sbmlToModel(sbml), slug);

  return null;
}
