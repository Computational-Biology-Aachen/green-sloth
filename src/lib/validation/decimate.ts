/**
 * Reduces a long line for drawing without losing what the eye needs: each bucket
 * keeps its first, last, lowest and highest sample, so pulses keep their tips. On
 * a log axis the buckets are even in log(x), so early times keep their detail.
 */
export function decimate(
  x: number[],
  y: number[],
  { log = false, buckets = 400 }: { log?: boolean; buckets?: number } = {},
): { x: number[]; y: number[] } {
  if (x.length <= 4 * buckets) return { x, y };
  const position = (v: number) => (log ? Math.log10(v) : v);
  const from = position(x[0]);
  const width = (position(x[x.length - 1]) - from) / buckets || 1;

  const keep = new Set<number>();
  let bucket = -1;
  let first = 0;
  let low = 0;
  let high = 0;
  let last = 0;
  const flush = () => {
    if (bucket >= 0) [first, low, high, last].forEach((i) => keep.add(i));
  };
  x.forEach((v, i) => {
    const b = Math.floor((position(v) - from) / width);
    if (b !== bucket) {
      flush();
      bucket = b;
      first = low = high = i;
    }
    if (y[i] < y[low]) low = i;
    if (y[i] > y[high]) high = i;
    last = i;
  });
  flush();
  const indices = [...keep].sort((a, b) => a - b);
  return { x: indices.map((i) => x[i]), y: indices.map((i) => y[i]) };
}
