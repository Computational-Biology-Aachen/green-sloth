import type { PamGroup } from "@computational-biology-aachen/mxlweb-core/pam";

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
  /** Per-analysis simulation timeout; defaults to the dashboard value. */
  timeoutInSeconds?: number;
}

export type ModelAnalysis = TimeCourseAnalysis | PamAnalysis;

export interface ModelMeta {
  slug: string;
  title: string;
  DOI: string;
  tags: Record<string, string[]>;
  /** Analyses auto-run on the model's dashboard. */
  analyses: ModelAnalysis[];
}
