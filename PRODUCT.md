# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Photosynthesis and plant-systems-biology researchers and graduate students (Computational Biology Group, RWTH Aachen, and the wider community) who want to explore, compare, and reuse published mechanistic photosynthesis ODE models without re-implementing them from scratch from a paper's equations. A secondary audience is contributors (researchers, developers, students) who reconstruct and submit new curated models.

## Product Purpose

GreenSloth is a client-side explorer for curated, validated photosynthesis ODE models. It ships several published models (e.g. Matuszyńska 2016 NPQ, Matuszyńska 2019, Davis 2017, Li 2021, and others under `src/lib/models/`), each reconstructed from its original publication with a dashboard, time-course plots, and PAM fluorescence protocols, plus a route to compare models side by side. It exists so mechanistic models don't stay "equations scattered across manuscripts and supplementary files" — instead they become reproducible, executable, documented software the community can inspect and build on. Success is a researcher finding a model, trusting it (because it's validated against the source paper), and exploring or comparing its behavior entirely in-browser.

## Positioning

Each model is independently reconstructed from its original publication and validated against that paper's figures before inclusion — this curation/validation discipline, not just having many models, is the differentiator. Combined with fully client-side execution (WASM RADAU5 solver via `mxlweb-core`, no server, no setup), models can be explored and compared side by side with zero install.

## Operating Context

- SvelteKit 5 (runes) + adapter-static, deployed as a static site at `/green-sloth`.
- Model building and compute backends (including the WASM RADAU5 solver) come from the shared `@computational-biology-aachen/mxlweb-core` package; the WASM runtime ships prebuilt, not built locally.
- Models are auto-discovered: a folder under `src/lib/models/<slug>/` with both `model.ts` (builds a `KineticModelBuilder`) and `meta.ts` (title, DOI, tags, dashboard analyses) registers itself — no central list to edit. `model.md` (prose description), `comment.md` (validation note), and `scheme.svg` (reaction scheme diagram) round out each model's page.
- Current model-authoring path is code-based (hand-written or mxlpy-codegen-emitted TypeScript); a planned data-first format (SBML / `.mxl.json` + metadata) is tracked but not yet landed (green-sloth#8) — don't assume it exists yet.
- Contribution happens via PR against the `green-sloth` repo, following `CONTRIBUTING.md`.
- Part of the CPBL/mxl tool family: consumes `@computational-biology-aachen/design` (shared tokens + Svelte components) and `@computational-biology-aachen/mxlweb-core` (model building + compute) as git dependencies.

## Capabilities and Constraints

- All computation is client-side; no server-side compute or persistence.
- Visual identity and component library are owned by the shared `@computational-biology-aachen/design` package (`/home/marvin/git/0-admin/pkg-js/design`), which has its own PRODUCT.md/DESIGN.md/impeccable config — GreenSloth inherits that system rather than defining its own tokens/components. Any DESIGN.md work for GreenSloth should reference and stay consistent with the design package's DESIGN.md, not fork a separate visual language.
- Each model page currently requires a hand-written or mxlpy-codegen'd `model.ts`; the data-first (SBML/`.mxl.json`) contribution path is not yet available.
- 23 models currently shipped under `src/lib/models/` (plus `models_backup/` for retired/superseded implementations).
- Terminology: "model" = one curated, validated photosynthesis ODE implementation with its own dashboard/analyses page; "analysis" = a dashboard view (`timecourse`, `pam`, etc.) configured per model in `meta.ts`.

## Brand Commitments

- No GreenSloth-specific visual identity beyond what `@computational-biology-aachen/design` provides (RWTH petrol/orange palette, Space Grotesk) — see that package's DESIGN.md for the authoritative token/component reference.
- Attribution: developed and maintained by the Computational Biology Group at RWTH Aachen University (PI: Prof. Dr. Anna Matuszyńska); original platform and curation/validation principles by Elouen Corvest (Master's thesis).

## Evidence on Hand

- Real, published models with real DOIs and validated-against-paper claims (see e.g. `src/lib/models/matuszynska2016/meta.ts`) — no fabricated model data, benchmarks, or testimonials apply here.
- `src/lib/features/about/About.svelte` carries the lab's own mission statement, usable verbatim for tone/voice reference.
- Contributors list and per-model contribution history are real, tracked in each model's `meta.ts`.
- No user research, analytics, or external testimonials exist or apply — this is an academic/community tool, not a commercial product.

## Product Principles

- Validation before inclusion: a model only ships once independently reconstructed and checked against its source publication's figures.
- Reproducibility over convenience: the goal is executable, documented software that replaces "equations in a supplement," not just a demo.
- Zero-setup exploration: everything runs client-side so a researcher can explore or compare models with nothing to install.
- One shared visual/component system: GreenSloth doesn't reinvent design — it inherits `@computational-biology-aachen/design` like the rest of the CPBL site family.
- Community-extensible: curation principles and contribution paths (currently code-based, moving toward data-first) exist so the collection can grow beyond the lab.

## Accessibility & Inclusion

No GreenSloth-specific accessibility requirement beyond what it inherits from `@computational-biology-aachen/design`, which targets a WCAG AA baseline (color contrast, keyboard navigation, semantic markup) across its components.
