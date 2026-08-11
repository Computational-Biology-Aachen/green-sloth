# ADR 0001: GreenSloth's Purpose — a Community-Contributed Photosynthesis Model Database

**Status:** Implemented
**Scope:** whole site

---

## 1. Context

GreenSloth ships several published photosynthesis ODE models (Matuszyńska 2016 NPQ,
Matuszyńska 2019, Davis 2017, Li 2021) with dashboards, time-course plots, PAM
fluorescence protocols, and a model-comparison view. Unlike the sibling `mxlweb` site,
GreenSloth has a `generate-mxl.ts` codegen pipeline and an `issue-to-model.mjs`
GitHub-issue-driven scaffolding script.

## 2. Decision

GreenSloth's actual mission is not "MxlWeb, but smaller" — it is a **community-driven
database specifically for photosynthesis models**. External users (other labs,
students, paper authors) are meant to be able to contribute a published model without
needing to be `mxlweb-core` contributors themselves.

## 3. Rationale

Domain-scoping to photosynthesis specifically (rather than MxlWeb's general-purpose
scope) lets this site build the deeper, domain-specific features a general explorer
wouldn't (PAM fluorescence protocols, side-by-side model comparison curated for
photosynthesis-relevant readouts). Being genuinely community-driven — as opposed to
"models added by whoever maintains the site" — is why it needs machinery MxlWeb doesn't:
a safe, structured contribution path (see
[ADR 0003](0003-issue-to-model-contribution-pipeline.md)) and a correctness gate on
what gets generated from a contribution (see
[ADR 0002](0002-model-ts-generate-mxl-parity-gate.md)).

## 4. Consequences

- New GreenSloth features should be evaluated against "does this help the
  photosynthesis-modeling community contribute/discover models," not against MxlWeb's
  general-explorer mission.
- Don't assume GreenSloth and MxlWeb should converge toward one codebase/pipeline —
  they solve different problems for different audiences, even though both sit on
  `mxlweb-core`.
