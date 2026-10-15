import type { SliderArgs } from "@computational-biology-aachen/mxlweb-core";

/** A parameter or (numeric) initial value the dashboard can show a slider for. */
export type SliderCandidate = {
  key: string;
  id: string;
  kind: "parameter" | "variable";
  name: string;
  value: number;
  /** The slider declared in the model's model.ts, if any. */
  declared?: SliderArgs;
};

/** A user's session-only choice for one candidate, overriding model.ts. */
export type SliderOverride = {
  enabled: boolean;
  min: string;
  max: string;
  step: string;
};

function fmt(x: number): string {
  return String(Number(x.toPrecision(3)));
}

/** One decade either side of the current value, 100 steps — kinetic
 * constants span many orders of magnitude, so a fixed absolute range would
 * be wrong for nearly every parameter. */
export function defaultSliderRange(
  value: number,
): Pick<SliderOverride, "min" | "max" | "step"> {
  if (value === 0 || !Number.isFinite(value)) {
    return { min: "0", max: "1", step: "0.01" };
  }
  const lo = Math.min(value / 10, value * 10);
  const hi = Math.max(value / 10, value * 10);
  return { min: fmt(lo), max: fmt(hi), step: fmt((hi - lo) / 100) };
}

/** The slider a candidate effectively gets: the user's override if set,
 * else whatever model.ts declares. */
export function effectiveSlider(
  candidate: SliderCandidate,
  override: SliderOverride | undefined,
): SliderOverride {
  if (override) return override;
  const range = candidate.declared ?? defaultSliderRange(candidate.value);
  return {
    enabled: candidate.declared !== undefined,
    min: range.min,
    max: range.max,
    step: range.step,
  };
}
