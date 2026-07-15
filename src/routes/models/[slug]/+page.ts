import { modelNames, models } from "$lib/models";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const prerender = true;

export function entries() {
  return modelNames.map((slug) => ({ slug }));
}

// Optional per-model assets, co-located in src/lib/models/<slug>/.
const mdModules = import.meta.glob("../../../lib/models/*/*.md", {
  query: "?raw",
  import: "default",
});
const schemeModules = import.meta.glob("../../../lib/models/*/scheme.{svg,png,jpg,jpeg,webp,gif,avif}", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

function slugOf(path: string): string | undefined {
  return path.match(/\/models\/([^/]+)\//)?.[1];
}

export const load: PageLoad = async ({ params }) => {
  const slug = params.slug;
  const meta = models[slug];
  // models only contains slugs with a meta.ts and a loadable model file.
  if (!meta) error(404, `Model "${slug}" not found`);

  let schemeUrl: string | null = null;
  for (const [path, url] of Object.entries(schemeModules)) {
    if (slugOf(path) === slug) schemeUrl = url;
  }

  async function loadMd(file: string): Promise<string | null> {
    const key = Object.keys(mdModules).find(
      (p) => slugOf(p) === slug && p.endsWith(`/${file}`),
    );
    if (!key) return null;
    return (await mdModules[key]()) as string;
  }

  const [desc, changes] = await Promise.all([
    loadMd("model.md"),
    loadMd("changes.md"),
  ]);

  return { slug, meta, schemeUrl, desc, changes };
};
