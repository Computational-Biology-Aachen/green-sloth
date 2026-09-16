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
 * The globs are lazy: each model's file becomes its own chunk, so building one
 * model only ever downloads that model's code/data, not the whole catalog.
 * Callers await `buildModel()` from a place that can wait for it (a route's
 * `load()`, or an effect) rather than a plain `$derived`.
 */
import {
  KineticModelBuilder,
  ModelBuilderBase,
} from "@computational-biology-aachen/mxlweb-core";
import { mxlJsonToModel } from "@computational-biology-aachen/mxlweb-core/mxl";
import { sbmlToModel } from "@computational-biology-aachen/mxlweb-core/sbml";

const jsonLoaders = import.meta.glob("$lib/models/*/model.mxl.json", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;
const sbmlLoaders = import.meta.glob("$lib/models/*/model.sbml", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;
const tsLoaders = import.meta.glob("$lib/models/*/model.ts") as Record<
  string,
  () => Promise<{ initModel: () => KineticModelBuilder }>
>;

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

const jsonBySlug = indexBySlug(jsonLoaders);
const sbmlBySlug = indexBySlug(sbmlLoaders);
const tsBySlug = indexBySlug(tsLoaders);

/**
 * Build a model's {@link KineticModelBuilder}, preferring code over data formats.
 * Resolves to `null` for an unknown slug (no model file in any format).
 */
export async function buildModel(
  slug: string,
): Promise<ModelBuilderBase | null> {
  const ts = tsBySlug.get(slug);
  if (ts !== undefined) return (await ts()).initModel();

  const json = jsonBySlug.get(slug);
  if (json !== undefined) return mxlJsonToModel(await json());

  const sbml = sbmlBySlug.get(slug);
  if (sbml !== undefined) return sbmlToModel(await sbml());

  return null;
}
