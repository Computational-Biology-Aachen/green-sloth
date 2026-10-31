/** Helpers for writing a model's `validation.ts`; each returns plain data. */
import type { Collect, ProtocolStep, Scenario } from "./types";

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

export const sweepIds = (prefix: string, n: number): string[] =>
  Array.from({ length: n }, (_, i) => `${prefix}${i}`);

/** The final value of each column per scenario, as one table against `x`. */
export function lastOf(ids: string[], x: number[], columns: string[]): Collect {
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
