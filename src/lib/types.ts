import type { PamGroup } from "@computational-biology-aachen/mxlweb-core/pam";
import type { Tags } from "./tags";
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
  /** Legend labels by series key, overriding the model's display names. */
  labels?: Record<string, string>;
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
  /** Legend labels by series key, overriding the model's display names. */
  labels?: Record<string, string>;
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

/**
 * A dashboard picker that swaps one model data set between alternatives,
 * e.g. a light spectrum. Exactly one option is active at a time.
 */
export interface DataSelect {
  /** Id of the model data set the active option overwrites. */
  data: string;
  title: string;
  /** Key of the option matching the model's data as loaded. */
  default: string;
  options: Array<{ key: string; label: string }>;
  /** Lazily loads each option's values, keyed by option key. */
  load: () => Promise<{ default: Record<string, number[]> }>;
  /** Draw each option's values as a spectrum over [xMin, xMax]. */
  preview?: { kind: "spectrum"; xMin: number; xMax: number; unit?: string };
}

export interface ModelMeta {
  slug: string;
  title: string;
  DOI?: string;
  license: string;
  journal: string;
  tags: Tags;
  /** Analyses auto-run on the model's dashboard. */
  analyses: ModelAnalysis[];
  /** Data-set pickers shown above the dashboard's sliders. */
  dataSelects?: DataSelect[];
  contributors: Array<{ desc: string; date: Date; contributor: Contributor }>;
}
