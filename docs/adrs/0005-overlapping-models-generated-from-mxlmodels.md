# ADR 0005: Models Shared with mxl-models Are Generated, Not Authored

**Status:** Implemented
**Scope:** `src/lib/models/<slug>/model.ts` for every model that also exists in mxl-models

---

## 1. Context

Seventeen models exist both here and in mxl-models. Maintained independently, they drifted
apart (ids, readouts, formulas, units), which made validating them against each other
impractical.

## 2. Decision

Their `model.ts` is generated from mxl-models (`python -m e2e.regenerate_greensloth` in
mxl-e2e; see mxl-models ADR 0006). mxl-models is the single source, including display
names, sliders, units and the docstring. mxl-e2e fails CI if a committed `model.ts`
differs from the codegen. `model.mxl.json` stays derived from `model.ts` (ADR 0002).

Models that only exist here are still authored here (ADR 0003).

## 3. Consequences

- Don't hand-edit a generated `model.ts`; change mxl-models and regenerate.
- Units are structured `Unit`s; the UI renders them with `unit.toTex(model.customUnits)`.
- Analyses in `meta.ts` and the validation notebooks use the generated (canonical) ids.
