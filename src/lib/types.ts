import type { PamGroup } from "@computational-biology-aachen/mxlweb-core/pam";
import type { Tags } from "./tags";
import type { FitDistribution } from "./random";
// Rexport
export type {
  ExperimentalData,
  ModelType,
  Organism,
  Part,
  Tags,
  TagValues,
} from "./tags";

/**
 * How to render an analysis result: a single chart, an explicit grid of
 * subplots, or a grid auto-split by the order of magnitude of the series.
 * Omitted → a single chart.
 */
export type PlotLayout =
  | { type: "single" }
  | {
      type: "grid";
      /**
       * Subplot groups by series label, rendered in order; any series not
       * named in a group share a trailing "everything else" subplot.
       */
      groups: string[][];
      /** Subplot columns. Defaults to `2`. */
      columns?: number;
      /** Share x-axis bounds across subplots. Defaults to `true`. */
      shareX?: boolean;
      /** Share y-axis bounds across subplots. Defaults to `false`. */
      shareY?: boolean;
    }
  | {
      /** Auto-split series into subplots by order of magnitude. */
      type: "magnitude";
      /** Subplot columns. Defaults to `2`. */
      columns?: number;
      /** Share x-axis bounds across subplots. Defaults to `true`. */
      shareX?: boolean;
      /** Share y-axis bounds across subplots. Defaults to `false`. */
      shareY?: boolean;
    };

/** A steady-state sweep shown in the analysis dashboard. */
export interface SweepAnalysis {
  type: "sweep";
  parameter: string;
  min: number;
  max: number;
  steps: number;
  /** Heading shown above the chart; omitted → no heading. */
  title?: string;
  yLabel: string;
  /** Include derived quantities (assignments/reactions) in the plot. */
  showDerived?: boolean;
  /** Keys to normalise to their own max before plotting. */
  selectedKeys?: string[];
  normalizedKeys?: string[];
  /** Chart layout; omitted → a single chart. */
  plot?: PlotLayout;
  xMin?: number | undefined;
  xMax?: number | undefined;
  yMin?: number | undefined;
  yMax?: number | undefined;
}

/** A time course (simulation over time) shown in the analysis dashboard. */
export interface TimeCourseAnalysis {
  type: "timecourse";
  /** Heading shown above the chart; omitted → no heading. */
  title?: string;
  /** Simulation end time (model time units). */
  tEnd: number;
  /** Number of output time points. */
  nTimePoints?: number;
  /** Variables/derived to plot; omitted → all variables. */
  variables?: string[];
  /** Include derived quantities (assignments/reactions) in the plot. */
  showDerived?: boolean;
  /** Keys to normalise to their own max before plotting. */
  normalizedKeys?: string[];
  /** Chart layout; omitted → a single chart. */
  plot?: PlotLayout;
  /** Per-analysis simulation timeout; defaults to the dashboard value. */
  timeoutInSeconds?: number;
}

/** A pulse-amplitude-modulation (PAM) fluorometry protocol. */
export interface PamAnalysis {
  type: "pam";
  /** Heading shown above the chart; omitted → no heading. */
  title?: string;
  /** Light protocol, grouped and repeated; expanded against `ppfdKey`. */
  pamProtocol: PamGroup[];
  /** Parameter the protocol drives (the photon flux density). */
  ppfdKey: string;
  /** Derived fluorescence key; when set, an NPQ curve is overlaid. */
  fluoKey?: string;
  /** Number of output time points. */
  nTimePoints?: number;
  /** Variables/derived to plot; omitted → all variables. */
  variables?: string[];
  /** Include derived quantities (assignments/reactions) in the plot. */
  showDerived?: boolean;
  /** Keys to normalise to their own max before plotting. */
  normalizedKeys?: string[];
  /** Upper y-axis bound. */
  yMax?: number;
  /** Chart layout; omitted → a single chart. */
  plot?: PlotLayout;
  /** Per-analysis simulation timeout; defaults to the dashboard value. */
  timeoutInSeconds?: number;
}

export type Contributor = {
  key: string;
  name: string;
  homepage?: string;
  orcid?: string;
  github?: string;
  gitlab?: string;
  photo?: string;
};

export type ModelAnalysis = TimeCourseAnalysis | PamAnalysis | SweepAnalysis;

export interface ModelMeta {
  slug: string;
  title: string;
  DOI?: string;
  license: string;
  journal: string;
  tags: Tags;
  /** Analyses auto-run on the model's dashboard. */
  analyses: ModelAnalysis[];
  contributors: Array<{ desc: string; date: Date; contributor: Contributor }>;
}

export type FitTargetMapping = {
  /** CSV column header this target reads from. */
  column: string;
  /** Model state-variable id or derived-quantity id this column is fit against. */
  key: string;
  kind: "state" | "derived";
};

export type FitParameterConfig = {
  id: string;
  fit: boolean;
  /** Fit in log-space (guarantees positivity) — requires the parameter's
   * current value to be > 0. */
  logSpace: boolean;
  /** Single-model mode: starting value the fit runs from — undefined falls
   * back to the model's current live parameter value. */
  initialGuess?: number;
  /** Ensemble mode: the per-member starting-point distribution this row
   * draws from — undefined falls back to a default normal distribution
   * around the model's current live parameter value (ADR 0006 §2.1). Kept
   * on the same row as `initialGuess`/`logSpace` rather than a parallel
   * array so switching the mode selector doesn't lose which parameters are
   * marked "fit" (ADR 0006 §2.9). */
  distribution?: FitDistribution;
};
