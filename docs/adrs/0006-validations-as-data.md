# ADR 0006: Validations Are Declared as Data and Run from `model.ts`

**Status:** Implemented
**Scope:** `src/lib/validation/`, `src/lib/models/<slug>/validation.ts`

---

## 1. Context

Models were validated in Python notebooks through an exported model, so the model the site
actually runs could drift from its validation without anyone noticing.

## 2. Decision

A model declares each publication figure as plain data in `validation.ts`:

- **Scenarios** on a clone of the unchanged `model.ts`: parameter and initial values, and
  structural edits (remove a reaction, replace a rule, clamp a variable). Shared models stay
  generated (ADR 0005); nothing here changes them.
- **Expressions** for column maths: strings in `validation.ts`, parsed (no `eval`) by mxlweb-core's reference parser to the shared mxl node trees (mxl-schemas ADR 0014), which the engine evaluates and the analysis export stores; `expr.ts` adapts them to dotted reference paths. And **named ops**
  (`ops.ts`) for anything non-scalar. Authoring in TS may compute values, such as a protocol
  or a CSV-derived constant, but no function reaches the engine.
- **Output grid:** exact times from RADAU5's dense output, so results line up with MxlPy's.

The same declaration is used three ways:

- **Website:** behind Run buttons, on a freshly built model, so sliders and fits don't affect
  it and it never re-runs by itself.
- **Tests:** `npm run test:validation` compares with `validation.golden.json`. Only models
  whose inputs changed run; a change to the engine or the mxlweb-core pin runs all of them.
- **Export:** `export/mxlpy.ts` compiles it to an MxlPy notebook. An export target can't drift
  from the site unnoticed, because `misc/mxl-e2e` runs the notebook against the same goldens.

Every op exists in both TS and Python in one registry, pinned to numpy/scipy by
`tests/fixtures/validation-ops.json`.

## 3. Goldens

`python -m e2e.validation_goldens <slug>` in `misc/mxl-e2e` runs the notebook on MxlPy's
export of `model.ts` and freezes the series listed in `SERIES`. Refreeze deliberately, when a
model change is intended, and review the diff.

The metric is `max |sim - golden| / scale` per series, with `scale = range(golden)`, floored at
`1e-3 * max |golden|` because a series flat to rounding noise has no meaningful range. The
default tolerance is 1 %; a looser one needs a comment saying why.

## 4. Consequences

- Python is only needed to refreeze goldens, not in this repo's CI.
- A chart can use two y axes, unlike the design guidance for dashboards, since these reproduce
  published figures. Figures with more than that split into panels.
