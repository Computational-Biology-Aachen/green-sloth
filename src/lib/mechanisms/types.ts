import type { TagValues } from "#lib/tags.js";

/** One mechanistic choice a modeller has to make, e.g. "Is oxygenation modelled?". */
export interface Decision {
  /** Anchor id; must match a heading in page.md (slugified, see `slugify`). */
  id: string;
  label: string;
  options: { id: string; label: string }[];
}

/** A paper (and optionally its green-sloth implementation) placed in the matrix. */
export interface MechanismRow {
  id: string;
  /** Short citation, e.g. "Poolman 2000". */
  citation: string;
  year: number;
  /** Bare DOI (no https://doi.org/ prefix). Omitted for books without one. */
  doi?: string;
  /** green-sloth model slug, when the paper is implemented. */
  slug?: string;
  /** Lineage lane (MechanismMeta.branches id). */
  branch?: string;
  /** Row ids this paper extends; drawn as edges in the lineage graph. */
  buildsOn?: string[];
  /** Decision id -> chosen option id(s). A missing decision renders as "–". */
  choices: Record<string, string | string[]>;
}

/** Every green-sloth model carrying this tag must appear as a row. */
export type Coverage = {
  [C in keyof TagValues]: { category: C; tag: TagValues[C][number] };
}[keyof TagValues];

export interface MechanismMeta {
  slug: string;
  title: string;
  /** One or two sentences for the index card and page header. */
  summary: string;
  /** Index ordering, ascending. */
  order: number;
  coverage: Coverage;
  decisions: Decision[];
  rows: MechanismRow[];
  /** Swim-lanes for the lineage graph; omit to skip the graph. */
  branches?: { id: string; label: string }[];
}
