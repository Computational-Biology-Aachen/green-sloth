export function arrayColumn<T>(arr: Array<Array<T>>, n: number): Array<T> {
  return arr.map((x) => x[n]);
}

/**
 * Serialize a map of CSS custom-property overrides into an inline `style`
 * attribute value, e.g. `{ "--foo": "1px" }` -> `"--foo:1px"`. Skips
 * undefined values so callers can spread optional overrides directly in.
 */
export function toStyleString(
  vars: Record<string, string | undefined>,
): string {
  return Object.entries(vars)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

export function fuzzyMatch(name: string, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (needle === "") return true;
  let i = 0;
  for (const ch of name.toLowerCase()) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return false;
}

export const widthSmall = "800px";

/** A single plotted series: a label and its values. */
export interface LineDataset {
  label: string;
  data: number[];
}

/** Largest absolute finite value of a series; characterises its magnitude. */
function seriesMagnitude(data: number[]): number {
  let max = 0;
  for (const v of data) {
    const a = Math.abs(v);
    if (Number.isFinite(a) && a > max) max = a;
  }
  return max;
}

/**
 * Partition datasets into the explicit `groups` (matched by label, in order),
 * with any series not named in a group collected into a trailing subplot.
 * Empty groups are dropped.
 */
export function partitionByGroups<T extends LineDataset>(
  datasets: T[],
  groups: string[][],
): T[][] {
  const used = new Set<string>();
  const out = groups
    .map((labels) => {
      const wanted = new Set(labels);
      const picked = datasets.filter((ds) => wanted.has(ds.label));
      for (const ds of picked) used.add(ds.label);
      return picked;
    })
    .filter((group) => group.length > 0);

  const remainder = datasets.filter((ds) => !used.has(ds.label));
  if (remainder.length > 0) out.push(remainder);
  return out;
}

/**
 * Partition datasets into subplots by the order of magnitude of their values,
 * mirroring mxlpy's `_partition_by_order_of_magnitude`: series are grouped by
 * `floor(log10(max |value|))` and the groups returned in ascending magnitude.
 * Series that are all-zero (no finite magnitude) form the first group.
 */
export function partitionByOrderOfMagnitude<T extends LineDataset>(
  datasets: T[],
): T[][] {
  const byOrder = new Map<number, T[]>();
  for (const ds of datasets) {
    const mag = seriesMagnitude(ds.data);
    const order = mag > 0 ? Math.floor(Math.log10(mag)) : -Infinity;
    const group = byOrder.get(order);
    if (group) group.push(ds);
    else byOrder.set(order, [ds]);
  }
  return [...byOrder.keys()]
    .sort((a, b) => a - b)
    .map((order) => byOrder.get(order)!);
}
