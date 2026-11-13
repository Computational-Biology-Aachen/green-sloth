import {
  getMechanism,
  loadMechanismPage,
  mechanismSlugs,
} from "#lib/mechanisms/index.js";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const prerender = true;

export function entries() {
  return mechanismSlugs.map((slug) => ({ slug }));
}

export const load: PageLoad = async ({ params }) => {
  const meta = getMechanism(params.slug);
  if (!meta) error(404, `Mechanism "${params.slug}" not found`);
  const md = await loadMechanismPage(params.slug);
  return { meta, md: md ?? "" };
};
