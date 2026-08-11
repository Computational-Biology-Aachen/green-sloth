# GreenSloth: Architecture Context

Entry point for *why* this site is shaped the way it is, written ahead of a maintainer
handoff. See the sibling `mxlweb-core` repo's `docs/adrs/CONTEXT.md` for the shared
engine this site consumes, and `mxlpy`'s `docs/adrs/CONTEXT.md` for the Python side of
the tool family. Compare against `mxlweb`'s own `docs/adrs/` for the contrasting
general-purpose-explorer site built on the same engine.

## What This Site Is

→ [ADR 0001 — A community-contributed photosynthesis model database, not a general explorer](0001-purpose-community-photosynthesis-database.md)

Everything else here follows from that mission: the site needs a way for non-core,
domain-expert contributors to add a model safely, which the general-purpose `mxlweb`
site (models added by core contributors) never needed.

## The Contribution Pipeline

→ [ADR 0003 — GitHub issue form → scaffolded model folder](0003-issue-to-model-contribution-pipeline.md)
→ [ADR 0002 — `model.ts` authoring source → parity-gated generated `.mxl.json`](0002-model-ts-generate-mxl-parity-gate.md)

Read these two together: 0003 is how a contribution enters the repo (structured issue
form → scaffolded `model.ts`), and 0002 is how that `model.ts` becomes the runtime
artifact the site actually loads, with a mechanical correctness gate in between.

## Build Dependencies

→ [ADR 0004 — Consumes mxlweb-core's prebuilt WASM, doesn't rebuild locally](0004-consumes-prebuilt-wasm-from-core.md)

## Inherited from mxlweb-core

This site does not re-decide: the no-server/all-client-side stance, the three compute
backends and their relative roles (WASM/Radau5 is what actually gets used here for
photosynthesis models' stiff dynamics), the `.mxl.json` format itself, or the MathML
expression representation.
