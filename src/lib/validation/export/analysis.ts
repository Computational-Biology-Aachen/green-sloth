/**
 * A model's validations as an mxl-schemas analysis document
 * (`v1/analysis.schema.json`, vendored as `../analysis.schema.json`).
 *
 * `validation.ts` files write expressions as strings; the document stores
 * them as node trees (mxl-schemas ADR 0014), so a consumer only evaluates
 * trees and never parses. Every string in an expression position is compiled
 * here with the reference parser.
 */
import {
  OdeModelBuilder,
  SteadyStateModelBuilder,
  type ModelBuilderBase,
} from "@computational-biology-aachen/mxlweb-core";
import type { JsonNode } from "@computational-biology-aachen/mxlweb-core/mathml";
import { parse } from "../expr";
import type {
  ModelEdit,
  Plot,
  PointSetup,
  Scenario,
  ScenarioValue,
  Validation,
} from "../types";

export const ANALYSIS_SCHEMA_URL =
  "https://raw.githubusercontent.com/Computational-Biology-Aachen/mxl-schemas/main/v1/analysis.schema.json";

export type ModelKind = "kinetic" | "ode" | "steady-state";

export function modelKind(model: ModelBuilderBase): ModelKind {
  if (model instanceof SteadyStateModelBuilder) return "steady-state";
  if (model instanceof OdeModelBuilder) return "ode";
  return "kinetic";
}

const tree = (src: string): JsonNode => parse(src).toJson();
const trees = (srcs: string[]): JsonNode[] => srcs.map(tree);

function mapValues<T, U>(
  o: Record<string, T> | undefined,
  f: (v: T) => U,
): Record<string, U> | undefined {
  return o === undefined
    ? undefined
    : Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));
}

const scenarioValues = (o: Record<string, ScenarioValue> | undefined) =>
  mapValues(o, (v) => (typeof v === "number" ? v : tree(v)));

function edits(es: ModelEdit[] | undefined) {
  return es?.map((e) =>
    "to" in e && typeof e.to === "string" ? { ...e, to: tree(e.to) } : e,
  );
}

function pointSetup<T extends PointSetup>(p: T) {
  return {
    ...p,
    set: scenarioValues(p.set),
    initial: scenarioValues(p.initial),
    edits: edits(p.edits),
  };
}

function scenario(s: Scenario) {
  return {
    ...s,
    parameters: scenarioValues(s.parameters),
    initial: scenarioValues(s.initial),
    edits: edits(s.edits),
    stages: s.stages?.map((st) => ({ ...st, edits: edits(st.edits) })),
  };
}

function plot(p: Plot) {
  switch (p.type) {
    case "line":
      return {
        ...p,
        x: tree(p.x),
        y: p.y.map((s) => ({
          ...s,
          of: tree(s.of),
          x: s.x === undefined ? undefined : tree(s.x),
          err: s.err === undefined ? undefined : tree(s.err),
        })),
      };
    case "scatter":
      return {
        ...p,
        series: p.series.map((s) => ({ ...s, x: tree(s.x), y: tree(s.y) })),
      };
    case "stackedBar":
      return {
        ...p,
        stacks: p.stacks.map((s) => ({ ...s, of: trees(s.of) })),
      };
    case "heatmap":
      return { ...p, z: p.z.map(trees) };
  }
}

/** One validation with every expression string replaced by its node tree. */
export function treeify(v: Validation): object {
  return {
    ...v,
    scenarios: mapValues(v.scenarios, scenario),
    scans: mapValues(v.scans, (s) => ({ ...s, edits: edits(s.edits) })),
    mca: mapValues(v.mca, pointSetup),
    stability: mapValues(v.stability, pointSetup),
    ops: v.ops?.map((op) =>
      op.op === "column" && typeof op.expr === "string"
        ? { ...op, expr: tree(op.expr) }
        : op,
    ),
    deriveEach: mapValues(v.deriveEach, tree),
    collect: mapValues(v.collect, (c) => ({
      ...c,
      columns: mapValues(c.columns, trees),
    })),
    derive: mapValues(v.derive, tree),
    plots: v.plots.map(plot),
    golden: mapValues(v.golden, (g) => ({ ...g, x: tree(g.x), y: tree(g.y) })),
  };
}

export function toAnalysisDocument(
  modelId: string,
  kind: ModelKind,
  validations: Validation[],
): object {
  return {
    $schema: ANALYSIS_SCHEMA_URL,
    spec_version: "1.1",
    kind: "analysis",
    model: { model_id: modelId, kind },
    // Through JSON, as a file would hold them: drops `undefined` fields.
    analyses: JSON.parse(JSON.stringify(validations.map(treeify))) as unknown,
  };
}
