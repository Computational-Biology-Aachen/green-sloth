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
  /** Output intervals for this step; overrides `pointsPerStep`. */
  points?: number;
}

/**
 * Sampling matches MxlPy's `time_points_per_step`: that many intervals per step.
 * With `tEval`, output is exactly those times instead.
 */
export interface ProtocolSimulation {
  kind: "protocol";
  steps: ProtocolStep[];
  pointsPerStep?: number;
  tEval?: number[];
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
  /** Replace an assignment's formula with an expression over model ids. */
  | { setAssignment: string; to: string }
  /** Replace a parameter with an assignment, e.g. a light driven by `time`. */
  | { parameterToAssignment: string; to: string }
  | { clampVariable: string; to: number }
  | { addParameter: string; value: number };

/** A run handing its final state on, unrecorded; `set` applies only to it. */
export type PreRun = Simulation & { set?: Record<string, number> };

/** One recorded phase of a chain; its output times count on from the last. */
export interface Stage {
  edits?: ModelEdit[];
  simulate: Simulation;
}

export interface Scenario {
  parameters?: Record<string, ScenarioValue>;
  initial?: Record<string, ScenarioValue>;
  edits?: ModelEdit[];
  /** Overrides the validation's `simulate` for this scenario. */
  simulate?: Simulation;
  /** Runs first, unrecorded, and hands its final state on (acclimation). */
  pre?: PreRun[];
  /** Replaces `simulate` with a chain of phases. */
  stages?: Stage[];
  /** A failed solve gives NaN columns instead of failing the validation. */
  allowFailure?: boolean;
  rtol?: number;
  atol?: number;
}

/**
 * One step of a scenario's data handling, run in order, per scenario (or only
 * for `scenario`). `{op: "column", as, expr}` adds a column; any other `op` is a
 * named op from ops.ts, whose column arguments are plain column names, and with
 * `into: true` its `value` also becomes the scenario column `as`.
 */
export interface OpSpec {
  op: string;
  as: string;
  scenario?: string;
  into?: boolean;
  [arg: string]: unknown;
}

/** Values collected across scenarios into one table: `<name>.x`, `<name>.<col>`. */
export interface Collect {
  x: number[];
  /** One expression per `x`. */
  columns: Record<string, string[]>;
}

/**
 * One simulation per row of scanned values, with the final values of `columns`
 * collected into the table `<name>.x`, `<name>.index`, `<name>.<column>`.
 */
export interface Scan {
  /** Absolute values per parameter; one value is held over the whole scan. */
  over: Record<string, number[]>;
  /** Factors on a parameter's default value. */
  scale?: Record<string, number[]>;
  /** `over` holds the axes of a cartesian product, the last varying fastest. */
  grid?: boolean;
  /** The table's `x`; defaults to the first scanned column of `over`. */
  x?: number[];
  columns: string[];
  /** Overrides the validation's `simulate`; a steady state or a time course. */
  simulate?: SteadyStateSimulation | TimeCourseSimulation;
  /** Applied once to the model; `addParameter` makes a parameter to scan. */
  edits?: ModelEdit[];
  /** A failed point gives NaN instead of failing the validation. */
  allowFailure?: boolean;
}

export interface LineSeries {
  /** Expression for the y values. */
  of: string;
  /** Expression for the x values; defaults to the plot's `x`. */
  x?: string;
  label?: string;
  axis?: "left" | "right";
  style?: "line" | "markers";
  /** Expressions for the error bars' half-widths. */
  err?: string;
}

export interface LinePlot {
  type: "line";
  title?: string;
  /** Expression for the x values. */
  x: string;
  y: LineSeries[];
  xLabel?: string;
  yLabel?: string;
  yRightLabel?: string;
  xLim?: [number, number];
  yLim?: [number, number];
  yRightLim?: [number, number];
  logX?: boolean;
  /** Shaded time spans, e.g. dark phases. */
  phases?: Array<{ from: number; to: number }>;
}

/** Points of `y` against `x`, optionally with the identity line. */
export interface ScatterPlot {
  type: "scatter";
  title?: string;
  series: Array<{ x: string; y: string; label?: string }>;
  xLabel?: string;
  yLabel?: string;
  lim?: [number, number];
  identity?: boolean;
}

export interface StackedBarPlot {
  type: "stackedBar";
  title?: string;
  categories: string[];
  /** One expression per category, per stacked segment. */
  stacks: Array<{ label: string; of: string[] }>;
  yLabel?: string;
  yLim?: [number, number];
}

export interface HeatmapPlot {
  type: "heatmap";
  title?: string;
  rows: string[];
  columns: string[];
  /** `z[row][column]` expressions. */
  z: string[][];
}

export type Plot = LinePlot | ScatterPlot | StackedBarPlot | HeatmapPlot;

export interface GoldenSeries {
  x: string;
  y: string;
  /**
   * Compare point by point, ignoring `x`: a peak's time can land one sample away
   * on a flat top without its value changing.
   */
  byIndex?: boolean;
  /**
   * Allowed max |sim - golden| / range(golden). Defaults to
   * {@link DEFAULT_TOLERANCE}; a looser value needs a comment saying why.
   */
  tolerance?: number;
}

export interface Validation {
  id: string;
  title: string;
  scenarios?: Record<string, Scenario>;
  scans?: Record<string, Scan>;
  simulate?: Simulation;
  rtol?: number;
  atol?: number;
  /** The scipy method of exported notebooks, where Radau can't start. */
  exportMethod?: string;
  /** Tolerances of exported notebooks, where they need to differ from `rtol`/`atol`. */
  exportTolerances?: { rtol: number; atol: number };
  /** Also return `ddt.<variable>` columns. */
  returnRhs?: boolean;
  /** Constant columns, such as measurements: `data.<name>`. */
  data?: Record<string, number[]>;
  /** Scenario data handling, see {@link OpSpec}. */
  ops?: OpSpec[];
  /** Columns added to every scenario before `ops`. */
  deriveEach?: Record<string, string>;
  collect?: Record<string, Collect>;
  /** Columns computed across scenarios, after `collect`. */
  derive?: Record<string, string>;
  plots: Plot[];
  golden?: Record<string, GoldenSeries>;
}

export const DEFAULT_TOLERANCE = 0.01;
