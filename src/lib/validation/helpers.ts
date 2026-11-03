/** Helpers for writing a model's `validation.ts`; each returns plain data. */
import type {
  Collect,
  Mca,
  ModelEdit,
  ProtocolStep,
  Scan,
  Scenario,
  Validation,
} from "./types";

export function linspace(from: number, to: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) =>
    i === n - 1 ? to : from + (i * (to - from)) / (n - 1),
  );
}

export function repeat<T>(xs: T[], n: number): T[] {
  return Array.from({ length: n }, () => xs).flat();
}

/** A `{<prefix><i>: scenario}` family, one per value. */
export function sweep<T>(
  prefix: string,
  values: T[],
  scenario: (value: T, i: number) => Scenario,
): Record<string, Scenario> {
  return Object.fromEntries(
    values.map((v, i) => [`${prefix}${i}`, scenario(v, i)]),
  );
}

/** The final value of each column per scenario, as one table against `x`. */
function lastOf(ids: string[], x: number[], columns: string[]): Collect {
  return {
    x,
    columns: Object.fromEntries(
      columns.map((c) => [c, ids.map((id) => `last(${id}.${c})`)]),
    ),
  };
}

export const step = (
  duration: number,
  set: Record<string, number>,
  points?: number,
): ProtocolStep => ({ duration, set, ...(points ? { points } : {}) });

/** MxlPy's `simulate(t)` without `steps`: 100 samples. */
export const defaultGrid = (tEnd: number): number[] => linspace(0, tEnd, 100);

/** The rows of a scan's `to_scan` table, without its `scale` columns. */
function scanRows(scan: Scan): Record<string, number>[] {
  const columns = Object.entries(scan.over);
  if (scan.grid) {
    return columns.reduce<Record<string, number>[]>(
      (rows, [id, values]) =>
        rows.flatMap((row) => values.map((v) => ({ ...row, [id]: v }))),
      [{}],
    );
  }
  const lengths = [...columns, ...Object.entries(scan.scale ?? {})].map(
    ([, values]) => values.length,
  );
  const n = Math.max(...lengths);
  if (lengths.some((l) => l !== n && l !== 1)) {
    throw new Error("A scan's columns differ in length");
  }
  return Array.from({ length: n }, (_, i) =>
    Object.fromEntries(
      columns.map(([id, v]) => [id, v.length === 1 ? v[0] : v[i]]),
    ),
  );
}

/** The table's `x`: as given, or the first column that varies. */
export function scanX(scan: Scan): number[] {
  const x =
    scan.x ?? Object.values(scan.over).find((values) => values.length > 1);
  if (!x) throw new Error("A scan without a varying column needs `x`");
  return x;
}

/** A scan as its per-point scenarios and table, as the engine runs them. */
function expandScan(
  name: string,
  scan: Scan,
  simulate: Validation["simulate"],
) {
  const rows = scanRows(scan);
  const ids = rows.map((_, i) => `${name}_${i}`);
  const scenarios = Object.fromEntries(
    rows.map((row, i): [string, Scenario] => {
      const edits = scan.edits?.map((e): ModelEdit =>
        "addParameter" in e && e.addParameter in row
          ? { ...e, value: row[e.addParameter] }
          : e,
      );
      const added = new Set(
        edits?.flatMap((e) => ("addParameter" in e ? [e.addParameter] : [])),
      );
      return [
        ids[i],
        {
          parameters: {
            ...Object.fromEntries(
              Object.entries(row).filter(([id]) => !added.has(id)),
            ),
            ...Object.fromEntries(
              Object.entries(scan.scale ?? {}).map(([id, f]) => [
                id,
                `param.${id} * ${f.length === 1 ? f[0] : f[i]}`,
              ]),
            ),
          },
          ...(edits ? { edits } : {}),
          simulate: scan.simulate ?? simulate,
          ...(scan.allowFailure ? { allowFailure: true } : {}),
        },
      ];
    }),
  );
  const { columns, x } = lastOf(ids, scanX(scan), scan.columns);
  const table: Collect = {
    x,
    columns: { index: ids.map((_, i) => String(i)), ...columns },
  };
  return { scenarios, table };
}

/**
 * The validation with its scans and response coefficients as plain scenarios
 * and `collect` tables. Elasticities and stability evaluate the model directly
 * and stay as they are, for run.ts.
 */
export function expandScans(
  v: Validation,
): Validation & { scenarios: Record<string, Scenario> } {
  const scans = [
    ...Object.entries(v.scans ?? {}).map(
      ([name, scan]) => [name, expandScan(name, scan, v.simulate)] as const,
    ),
    ...Object.entries(v.mca ?? {})
      .filter(([, mca]) => mca.type === "responseCoefficients")
      .map(([name, mca]) => [name, expandResponse(name, mca)] as const),
  ];
  return {
    ...v,
    scenarios: Object.assign(
      {},
      v.scenarios,
      ...scans.map(([, s]) => s.scenarios),
    ),
    // Scan tables first, so a figure's own tables can regroup them.
    collect: {
      ...Object.fromEntries(scans.map(([name, s]) => [name, s.table])),
      ...v.collect,
    },
  };
}

/** MxlPy's defaults for `mca`. */
export const MCA_DEFAULTS = { normalized: true, displacement: 1e-4 };

/**
 * Response coefficients as central-difference scenarios plus their table:
 * `(y(p(1 + d)) - y(p(1 - d))) / (2 d p)`, times `p / y(p)` when normalised.
 */
export function expandResponse(name: string, mca: Mca) {
  const { normalized, displacement: d } = { ...MCA_DEFAULTS, ...mca };
  const simulate = { kind: "steadyState" } as const;
  const base: Scenario = {
    ...(mca.set ? { parameters: mca.set } : {}),
    ...(mca.initial ? { initial: mca.initial } : {}),
    ...(mca.edits ? { edits: mca.edits } : {}),
    simulate,
  };
  const ref = `${name}_ref`;
  const old = (p: string) => {
    const v = mca.set?.[p];
    return v === undefined ? `param.${p}` : `(${v})`;
  };
  const scenarios: Record<string, Scenario> = { [ref]: base };
  mca.wrt.forEach((p, i) => {
    for (const [dir, factor] of [
      ["up", 1 + d],
      ["down", 1 - d],
    ] as const) {
      scenarios[`${name}_${dir}${i}`] = {
        ...base,
        parameters: { ...mca.set, [p]: `${old(p)} * ${factor}` },
      };
    }
  });
  const table: Collect = {
    x: mca.wrt.map((_, i) => i),
    columns: Object.fromEntries(
      mca.outputs.map((out) => [
        out,
        mca.wrt.map((p, i) => {
          const diff = `(last(${name}_up${i}.${out}) - last(${name}_down${i}.${out}))`;
          return normalized
            ? `${diff} / ${2 * d} / last(${ref}.${out})`
            : `${diff} / (${2 * d} * ${old(p)})`;
        }),
      ]),
    ),
  };
  return { scenarios, table };
}
