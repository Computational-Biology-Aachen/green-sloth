/**
 * The validation expression language: column maths written as strings, such
 * as `wt.NPQ - npq4.NPQ` or `-log10(H_lumen * 1e-6)`. The strings are only the
 * authoring form. They parse (mxlweb-core's reference parser) to the shared
 * mxl node trees of mxl-schemas ADR 0014: element-wise nodes broadcast over
 * columns, array nodes (`Sum`, `Index`, `At`, …) reduce or select, and a
 * reference is a `Name` of its dotted path. Analysis files store the trees,
 * so this module is all that stands between a string and the engine, the
 * notebook export and model edits.
 */

import {
  type Base,
  EXPRESSION_FUNCTIONS,
  Name,
  evaluate as evaluateTree,
  parseExpression,
  type Value,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export type Expr = Base;
export type { Value };

/** The function names the string syntax knows. */
export const FUNCTIONS = EXPRESSION_FUNCTIONS;

/** Parse an expression string to its node tree. */
export function parse(src: string): Expr {
  return parseExpression(src);
}

/** Whether `e` is a bare reference (a single `Name`). */
export function isRef(e: Expr): e is Name {
  return e instanceof Name;
}

/** Every reference in an expression, as its dotted path, for static id checks. */
export function refs(e: Expr): string[][] {
  return [...e.getSymbols(new Set())].map((s) => s.split("."));
}

/** `resolve` maps a reference path to its value, throwing if it doesn't exist. */
export function evaluate(e: Expr, resolve: (path: string[]) => Value): Value {
  return evaluateTree(e, (name) => resolve(name.split(".")));
}

/** The same expression as numpy; `ref` maps a reference path to a Python array. */
export function toPython(e: Expr, ref: (path: string[]) => string): string {
  const names = new Map(
    [...e.getSymbols(new Set())].map((s) => [s, ref(s.split("."))]),
  );
  return e.toPy(names);
}

/**
 * The same expression as model math, for structural edits: references are
 * model ids, and nothing may reduce an array (model data aside).
 */
export function toMathml(e: Expr): Base {
  for (const [path] of refs(e).filter((p) => p.length > 1)) {
    throw new Error(`"${path}.…" can't be used in a model edit`);
  }
  return e;
}
