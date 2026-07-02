import type { PamGroup } from "@computational-biology-aachen/mxlweb-core/pam";

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
};

export type ModelAnalysis = TimeCourseAnalysis | PamAnalysis | SweepAnalysis;

export type Part =
  | "PSII"
  | "OEC"
  | "ATP Synthase"
  | "Cytochrome b6f"
  | "PQ Cycle"
  | "PC"
  | "FNR"
  | "PSI"
  | "CBB Cycle";

export type ModelType = "ODE" | "Steady State";

// Maps each tag category to its value union. Add a category here (and its
// value type) to extend the tag system — Tags below follows automatically.
type TagValues = {
  "Part of Photosynthesis": Array<Part>;
  "Model type": Array<ModelType>;
};

export type Tags = {
  [K in keyof TagValues]: TagValues[K];
};

export interface ModelMeta {
  slug: string;
  title: string;
  DOI?: string;
  tags: Tags;
  /** Analyses auto-run on the model's dashboard. */
  analyses: ModelAnalysis[];
  contributors: Array<{ desc: string; date: Date; contributor: Contributor }>;
}
