/**
 * Enumerates which model slugs ship a loadable file, without loading the
 * files themselves. Deliberately does not import `loadModel.ts`: that module's
 * `buildModel()` needs the actual eager model data (~2MB across all models),
 * and importing anything from that file pulls the whole module — data
 * included — into every chunk that needs it. Pages that only need the slug
 * list (model gallery, about page's contributor list, prerender `entries()`)
 * import `buildableSlugs` from here instead, so they stay free of that data.
 */
const jsonPaths = import.meta.glob("$lib/models/*/model.mxl.json");
const sbmlPaths = import.meta.glob("$lib/models/*/model.sbml");
const tsPaths = import.meta.glob("$lib/models/*/model.ts");

const slugOf = (path: string): string | undefined =>
  path.match(/\/models\/([^/]+)\//)?.[1];

function slugsOf(paths: Record<string, unknown>): string[] {
  return Object.keys(paths)
    .map(slugOf)
    .filter((s): s is string => s !== undefined);
}

/** Slugs that ship at least one loadable model format. */
export const buildableSlugs: ReadonlySet<string> = new Set([
  ...slugsOf(jsonPaths),
  ...slugsOf(sbmlPaths),
  ...slugsOf(tsPaths),
]);
