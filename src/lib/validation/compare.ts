/**
 * Compares a validation's series with its frozen golden. The metric is
 * max |sim - golden| / range(golden) per series; an exactly flat golden has no
 * range, so it falls back to max(|golden|), or 1 if that is zero too.
 */
import { DEFAULT_TOLERANCE, type Validation } from "./types";
import type { ValidationResult } from "./run";

export type GoldenFile = Record<
  string,
  Record<string, { x: number[]; y: number[] }>
>;

export interface SeriesComparison {
  figure: string;
  series: string;
  relativeError: number;
  tolerance: number;
  atX: number;
  passed: boolean;
}

const X_MATCH = 1e-9;

export function compareSeries(
  simX: number[],
  simY: number[],
  golden: { x: number[]; y: number[] },
): { relativeError: number; atX: number } {
  const lo = Math.min(...golden.y);
  const hi = Math.max(...golden.y);
  const scale = hi - lo || Math.max(Math.abs(lo), Math.abs(hi)) || 1;
  let relativeError = 0;
  let atX = NaN;
  let j = 0;
  golden.x.forEach((x, i) => {
    const tol = X_MATCH * (1 + Math.abs(x));
    while (j < simX.length - 1 && simX[j] < x - tol) j++;
    if (Math.abs(simX[j] - x) > tol) {
      throw new Error(`No simulated point at x=${x} (nearest ${simX[j]})`);
    }
    const err = Math.abs(simY[j] - golden.y[i]) / scale;
    // NaN must fail, and comparisons with it are always false.
    if (!(err <= relativeError)) {
      relativeError = err;
      atX = x;
    }
  });
  return { relativeError, atX };
}

export function compareValidation(
  validation: Validation,
  result: ValidationResult,
  golden: GoldenFile,
): SeriesComparison[] {
  return Object.entries(validation.golden ?? {}).map(([series, spec]) => {
    const want = golden[validation.id]?.[series];
    if (!want) {
      throw new Error(`No golden for ${validation.id}/${series}`);
    }
    const { relativeError, atX } = compareSeries(
      result.column(spec.x),
      result.column(spec.y),
      want,
    );
    const tolerance = spec.tolerance ?? DEFAULT_TOLERANCE;
    return {
      figure: validation.id,
      series,
      relativeError,
      tolerance,
      atX,
      passed: relativeError <= tolerance,
    };
  });
}
