/**
 * Compares a validation's series with its frozen golden. The metric is
 * max |sim - golden| / scale per series, where scale is range(golden), but at
 * least 1e-3 of max(|golden|): a series flat to rounding noise has no meaningful
 * range. An all-zero golden uses a scale of 1.
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
const FLAT_FLOOR = 1e-3;

export function compareSeries(
  simX: number[],
  simY: number[],
  golden: { x: number[]; y: number[] },
  byIndex = false,
): { relativeError: number; atX: number } {
  const lo = golden.y.reduce((a, b) => Math.min(a, b));
  const hi = golden.y.reduce((a, b) => Math.max(a, b));
  const scale =
    Math.max(hi - lo, FLAT_FLOOR * Math.max(Math.abs(lo), Math.abs(hi))) || 1;
  let relativeError = 0;
  let atX = NaN;
  let j = 0;
  if (byIndex && simX.length !== golden.x.length) {
    throw new Error(`${simX.length} points, golden has ${golden.x.length}`);
  }
  golden.x.forEach((x, i) => {
    if (byIndex) {
      j = i;
    } else {
      const tol = X_MATCH * (1 + Math.abs(x));
      // Nearest, not first within `tol`: that spans several samples at tiny x.
      while (
        j < simX.length - 1 &&
        Math.abs(simX[j + 1] - x) <= Math.abs(simX[j] - x)
      ) {
        j++;
      }
      if (Math.abs(simX[j] - x) > tol) {
        throw new Error(`No simulated point at x=${x} (nearest ${simX[j]})`);
      }
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
      spec.byIndex,
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
