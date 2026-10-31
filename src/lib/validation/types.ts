/**
 * A model's validations: plain data declaring the figures that reproduce its
 * publication. Authored per model in `models/<slug>/validation.ts`; the engine
 * (run.ts), the tests and the export targets (export/) all read the same data.
 */

/** A value, or an expression over `param.x` / `init.x` (expr.ts). */
export type ScenarioValue = number | string;

/** One step of a protocol: hold these parameter values for `duration`. */
export interface ProtocolStep {
  duration: number;
  set: Record<string, number>;
}

/** Sampling matches MxlPy's `time_points_per_step`: that many intervals per step. */
export interface ProtocolSimulation {
  kind: "protocol";
  steps: ProtocolStep[];
  pointsPerStep: number;
}

export interface TimeCourseSimulation {
  kind: "timeCourse";
  tEval: number[];
}

export interface SteadyStateSimulation {
  kind: "steadyState";
  tol?: number;
}

export type Simulation =
  ProtocolSimulation | TimeCourseSimulation | SteadyStateSimulation;

/** A structural change, applied to a clone of the model for one scenario. */
export type ModelEdit =
  | { removeReaction: string }
  | { setAssignment: string; to: string; args?: never }
  | { clampVariable: string; to: number }
  | { addParameter: string; value: number };

export interface Scenario {
  parameters?: Record<string, ScenarioValue>;
  initial?: Record<string, ScenarioValue>;
  edits?: ModelEdit[];
  /** Overrides the validation's `simulate` for this scenario. */
  simulate?: Simulation;
  /** Runs first, unrecorded, and hands its final state on (acclimation). */
  pre?: Simulation[];
  rtol?: number;
  atol?: number;
}

/**
 * A named op applied per scenario (or only to `scenario`); see ops.ts. Runs after
 * `deriveEach`, and column arguments are plain column names, so every op maps
 * directly onto a pandas column in the export targets.
 */
export interface OpSpec {
  op: string;
  as: string;
  scenario?: string;
  [arg: string]: unknown;
}

export interface LineSeries {
  /** Expression for the y values. */
  of: string;
  /** Expression for the x values; defaults to the plot's `x`. */
  x?: string;
  label?: string;
}

export interface LinePlot {
  type: "line";
  title?: string;
  /** Expression for the x values. */
  x: string;
  y: LineSeries[];
  xLabel?: string;
  yLabel?: string;
  xLim?: [number, number];
  yLim?: [number, number];
}

export type Plot = LinePlot;

export interface GoldenSeries {
  x: string;
  y: string;
  /**
   * Allowed max |sim - golden| / range(golden). Defaults to
   * {@link DEFAULT_TOLERANCE}; a looser value needs a comment saying why.
   */
  tolerance?: number;
}

export interface Validation {
  id: string;
  title: string;
  scenarios: Record<string, Scenario>;
  simulate: Simulation;
  rtol?: number;
  atol?: number;
  ops?: OpSpec[];
  /** Columns added to every scenario; bare names resolve in that scenario. */
  deriveEach?: Record<string, string>;
  /** Columns computed across scenarios. */
  derive?: Record<string, string>;
  plots: Plot[];
  golden?: Record<string, GoldenSeries>;
}

export const DEFAULT_TOLERANCE = 0.01;
