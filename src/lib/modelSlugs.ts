/**
 * Enumerates which model slugs ship a loadable file, without loading the
 * files themselves. Deliberately does not import `loadModel.ts`: even though
 * that module's own globs are lazy, pages that only need the slug list
 * (model gallery, about page's contributor list, prerender `entries()`)
 * shouldn't have to pull in `buildModel()` and its per-model loader map just
 * to ask "which slugs exist" — this file answers that from path keys alone.
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
