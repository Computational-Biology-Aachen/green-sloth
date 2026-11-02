/**
 * A model's validations as an mxl-schemas analysis document
 * (`v1/analysis.schema.json`, vendored as `../analysis.schema.json`).
 */
import {
  OdeModelBuilder,
  SteadyStateModelBuilder,
  type ModelBuilderBase,
} from "@computational-biology-aachen/mxlweb-core";
import type { Validation } from "../types";

export const ANALYSIS_SCHEMA_URL =
  "https://raw.githubusercontent.com/Computational-Biology-Aachen/mxl-schemas/main/v1/analysis.schema.json";

export type ModelKind = "kinetic" | "ode" | "steady-state";

export function modelKind(model: ModelBuilderBase): ModelKind {
  if (model instanceof SteadyStateModelBuilder) return "steady-state";
  if (model instanceof OdeModelBuilder) return "ode";
  return "kinetic";
}

export function toAnalysisDocument(
  modelId: string,
  kind: ModelKind,
  validations: Validation[],
): object {
  return {
    $schema: ANALYSIS_SCHEMA_URL,
    spec_version: "1.0",
    kind: "analysis",
    model: { model_id: modelId, kind },
    // Through JSON, as a file would hold them: drops `undefined` fields.
    analyses: JSON.parse(JSON.stringify(validations)) as unknown,
  };
}
