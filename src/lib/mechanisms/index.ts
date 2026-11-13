import type { MechanismMeta } from "./types";

// Auto-discover mechanism pages: a src/lib/mechanisms/<slug>/ folder with a
// meta.ts and a page.md registers itself, like src/lib/models.ts.
const metaModules = import.meta.glob<{ meta: MechanismMeta }>("./*/meta.ts", {
  eager: true,
});

const pageModules = import.meta.glob<string>("./*/page.md", {
  query: "?raw",
  import: "default",
});

function slugOf(path: string): string | undefined {
  return path.match(/^\.\/([^/]+)\//)?.[1];
}

export const mechanisms: MechanismMeta[] = Object.values(metaModules)
  .map((m) => m.meta)
  .sort((a, b) => a.order - b.order);

export const mechanismSlugs = mechanisms.map((m) => m.slug);

export function getMechanism(slug: string): MechanismMeta | undefined {
  return mechanisms.find((m) => m.slug === slug);
}

export async function loadMechanismPage(slug: string): Promise<string | null> {
  const key = Object.keys(pageModules).find((p) => slugOf(p) === slug);
  return key ? pageModules[key]() : null;
}

/** Heading text -> anchor id; page.md headings and Decision ids must agree. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
