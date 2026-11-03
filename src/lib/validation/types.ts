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

/** Model changes for one point analysis, applied as in a {@link Scenario}. */
export interface PointSetup {
  set?: Record<string, ScenarioValue>;
  initial?: Record<string, ScenarioValue>;
  edits?: ModelEdit[];
}

/**
 * Metabolic control analysis by central differences, as MxlPy's `mca`. Gives
 * the table `<name>.x` (index of `wrt`) and one column `<name>.<output>` per
 * output, each holding one coefficient per entry of `wrt`.
 *
 * - `responseCoefficients`: outputs at steady state against parameters `wrt`
 * - `parameterElasticities`: reaction rates against parameters `wrt`
 * - `variableElasticities`: reaction rates against variables `wrt`
 *
 * Elasticities are evaluated without simulating, at the initial state or, with
 * `at: "steadyState"`, at the steady state.
 */
export interface Mca extends PointSetup {
  type:
    "responseCoefficients" | "parameterElasticities" | "variableElasticities";
  wrt: string[];
  outputs: string[];
  normalized?: boolean;
  displacement?: number;
  at?: "initial" | "steadyState";
}

/**
 * Local stability at the steady state: eigenvalues of the Jacobian, sorted by
 * real then imaginary part, as the table `<name>.real`, `<name>.imag`.
 */
export type Stability = PointSetup;

/**
 * How a series is drawn, in matplotlib's terms so a notebook figure carries over
 * one to one. Presentation only: the analysis export drops it.
 */
export interface SeriesStyle {
  /** Any CSS colour; unset series take matplotlib's tab10 cycle, per axis. */
  color?: string;
  /** A matplotlib marker; on a line it marks every point. */
  marker?:
    "o" | "s" | "^" | "v" | "<" | ">" | "D" | "d" | "x" | "+" | "*" | ".";
  /** matplotlib `markersize`, in points (diameter); default 6. */
  markerSize?: number;
  /** matplotlib `markerfacecolor`; `"none"` draws hollow markers. */
  markerFace?: string;
  /** matplotlib `markeredgecolor`; defaults to `color`. */
  markerEdge?: string;
  /**
   * matplotlib `linestyle`; default solid. An array is a custom pattern, on/off
   * lengths in line widths, as matplotlib's `(0, (3, 1, 1, 1))`.
   */
  dash?: "solid" | "dashed" | "dotted" | "dashdot" | number[];
  /** matplotlib `linewidth`, in points; default 1.5, 0 draws no line. */
  lineWidth?: number;
  alpha?: number;
  /** Draw above (higher) or below lower-`zorder` series; matplotlib's default 2. */
  zorder?: number;
  /** Mark only every n-th point, as matplotlib's `markevery`. */
  markEvery?: number;
}

export interface LineSeries extends SeriesStyle {
  /** Expression for the y values. */
  of: string;
  /** Expression for the x values; defaults to the plot's `x`. */
  x?: string;
  label?: string;
  /** `"left"` (default), `"right"`, or the `id` of one of the plot's `axes`. */
  axis?: string;
  style?: "line" | "markers";
  /** Expressions for the error bars' half-widths. */
  err?: string;
  /** matplotlib `elinewidth` and `capsize`, in points. */
  errLineWidth?: number;
  capSize?: number;
  /** Fill between `of` and this expression (matplotlib's `fill_between`). */
  fillTo?: string;
  /**
   * Colour each segment by the sign of an expression at its first point, as a
   * notebook's `LineCollection` does: e.g. rising versus falling light.
   */
  colorBySign?: { of: string; positive: string; negative: string };
  /** Text written just right of the series' last point, as a direct label. */
  endLabel?: string;
  /** Draw only the points whose x lies in this range, as a notebook's `.loc[...]` does. */
  xRange?: [number, number];
}

/** A reference line across the plot (matplotlib's `axhline` / `axvline`). */
export interface Rule {
  value: number;
  color?: string;
  dash?: SeriesStyle["dash"];
  lineWidth?: number;
  axis?: string;
}

/**
 * Text in the plot, at data coordinates or (`coords: "axes"`) 0–1 of the plot
 * area. A data position may be an expression, e.g. a computed peak.
 */
export interface Annotation {
  text: string;
  x: number | string;
  y: number | string;
  coords?: "data" | "axes";
  color?: string;
  /** Font size in points. */
  size?: number;
  bold?: boolean;
  align?: "left" | "center" | "right";
}

/** A shaded span; `y` limits it vertically (a filled rectangle), `text` labels it. */
export interface Phase {
  from: number;
  to: number;
  color?: string;
  alpha?: number;
  y?: [number, number];
  /** Outline colour, e.g. for light/dark bars. */
  edgeColor?: string;
  /** Draw as a bar above the plot area (matplotlib's unclipped patch). */
  above?: boolean;
  text?: string;
  textColor?: string;
}

/** Presentation shared by plots; dropped by the analysis export. */
interface PlotLayout {
  /** The panel letter of a multi-panel figure, shown before the title. */
  panel?: string;
  /** Show the legend; defaults to when more than one series is labelled. */
  legend?: boolean;
  legendTitle?: string;
  /** Where the legend goes; default top. */
  legendPosition?: "top" | "bottom" | "right";
  /** Grid lines; off by default, as in matplotlib. */
  grid?: boolean;
  annotations?: Annotation[];
}

export interface LinePlot extends PlotLayout {
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
  /** Colour of the left / right axis title and ticks. */
  yColor?: string;
  yRightColor?: string;
  logX?: boolean;
  logY?: boolean;
  reverseX?: boolean;
  reverseY?: boolean;
  xTicks?: number[];
  /** Labels for `xTicks`, one each. */
  xTickLabels?: string[];
  yTicks?: number[];
  yRightTicks?: number[];
  /** Shaded time spans, e.g. dark phases. */
  phases?: Phase[];
  hLines?: Rule[];
  vLines?: Rule[];
  /** Further y axes, stacked outside the left or right one (matplotlib twins). */
  axes?: Array<{
    id: string;
    position?: "left" | "right";
    label?: string;
    lim?: [number, number];
    ticks?: number[];
    color?: string;
  }>;
}

/** Points of `y` against `x`, optionally with the identity line. */
export interface ScatterPlot extends PlotLayout {
  type: "scatter";
  title?: string;
  series: Array<{ x: string; y: string; label?: string } & SeriesStyle>;
  xLabel?: string;
  yLabel?: string;
  lim?: [number, number];
  /** Separate axis bounds, overriding `lim`. */
  xLim?: [number, number];
  yLim?: [number, number];
  xTicks?: number[];
  yTicks?: number[];
  identity?: boolean;
}

export interface StackedBarPlot extends PlotLayout {
  type: "stackedBar";
  title?: string;
  categories: string[];
  /** One expression per category, per stacked segment. */
  stacks: Array<{ label: string; of: string[]; color?: string }>;
  yLabel?: string;
  yLim?: [number, number];
  yTicks?: number[];
  /** List the segments top to bottom in the legend. */
  reverseLegend?: boolean;
}

export interface HeatmapPlot extends PlotLayout {
  type: "heatmap";
  title?: string;
  rows: string[];
  columns: string[];
  /** `z[row][column]` expressions. */
  z: string[][];
  /**
   * Diverging around zero (default), matplotlib's `rainbow`, or its `RdBu_r`
   * (symmetric around zero, as MxlPy's `plot.heatmap`).
   */
  colormap?: "diverging" | "rainbow" | "RdBu_r";
  /** Titles of the columns and the rows. */
  xLabel?: string;
  yLabel?: string;
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
  /**
   * Panels per row, as the figure's subplot columns, or one count per row for
   * rows of different lengths; presentation only.
   */
  columns?: number | number[];
  scenarios?: Record<string, Scenario>;
  scans?: Record<string, Scan>;
  mca?: Record<string, Mca>;
  stability?: Record<string, Stability>;
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
