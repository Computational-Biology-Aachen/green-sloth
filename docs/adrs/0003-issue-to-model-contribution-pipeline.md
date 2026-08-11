# ADR 0003: GitHub Issue Form → Scaffolded Model Folder

**Status:** Implemented
**Scope:** `scripts/issue-to-model.mjs`, `.github/ISSUE_TEMPLATE/model-contribution.yml`

---

## 1. Context

`issue-to-model.mjs` parses a structured "Contribute a model" GitHub issue-form
submission and materializes a new model folder under `src/lib/models/<slug>/`. It's
pure Node with no dependencies (so it's unit-testable locally by feeding it a sample
issue body), driven by a GitHub Actions workflow, and exits non-zero on a malformed
submission.

## 2. Decision

Make model contribution a **structured GitHub issue form**, not a raw pull request
against `model.ts`, with automated scaffolding turning an accepted submission directly
into a starting-point model folder.

## 3. Rationale

This is the actual mechanism behind [ADR 0001](0001-purpose-community-photosynthesis-database.md)'s
"community-contributed database" mission: a contributor doesn't need to know
`mxlweb-core`'s builder API, this repo's file layout, or TypeScript at all — they fill
out a form describing their published model, and the workflow scaffolds the files. This
lowers the bar for domain scientists (who may not be comfortable opening a PR against
unfamiliar TypeScript) while still producing a normal `model.ts` that then goes through
the same authoring/parity-gate path as any other model
([ADR 0002](0002-model-ts-generate-mxl-parity-gate.md)) before being merged.

Keeping the script dependency-free and locally unit-testable (`ISSUE_BODY=... node
scripts/issue-to-model.mjs`) matters specifically because it's parsing untrusted,
free-form user input from a public issue form — it needs to be easy to test against
malformed/adversarial submissions without spinning up the full Actions environment.

## 4. Consequences

- Changes to the issue-form template (`model-contribution.yml`) and the parser
  (`issue-to-model.mjs`) must stay in lock-step — the parser's section-splitting logic
  depends on the form's exact field labels.
- Don't bypass the issue-form path for "quick" model additions if the goal is keeping
  the contribution story consistent and low-friction for external contributors — even
  maintainer-added models should probably go through the same path to keep it exercised
  and correct.
