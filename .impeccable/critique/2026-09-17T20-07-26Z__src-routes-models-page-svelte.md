---
target: Model gallery (/models)
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 1
target_identity: "file:/home/marvin/git/0-admin/pages/green-sloth/src/routes/models/+page.svelte"
target_fingerprint: "sha256:0e8fe6a3b733a61e90a6ae6282c83c11bb4dc63160855e598a600026546d3f37"
target_path: /home/marvin/git/0-admin/pages/green-sloth/src/routes/models/+page.svelte
timestamp: 2026-09-17T20-07-26Z
slug: src-routes-models-page-svelte
closed: true
---
Method: dual-agent (A: ade0fcabc9d381d9c · B: a98e401925fbe1ccc)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No result count ("14 of 22 models"), no loading state for scheme images |
| 2 | Match System / Real World | 3 | Photosynthesis vocabulary and apparatus diagram match the audience's mental model well |
| 3 | User Control and Freedom | 2 | No "clear all filters" — must un-click each of up to ~35 active tags individually |
| 4 | Consistency and Standards | 2 | Three tag-selection widgets (SVG apparatus, ButtonTab pills, text input) with different visual and a11y semantics for the same action |
| 5 | Error Prevention | 3 | Filtering can't error; AND-combination narrows silently rather than blocking |
| 6 | Recognition Rather Than Recall | 2 | ~35 pills + 9 diagram regions visible at once before any model is scanned |
| 7 | Flexibility and Efficiency | 3 | Ctrl/Cmd+F and `/` hijack focus into the filter input — genuine power-user touch |
| 8 | Aesthetic and Minimalist Design | 1 | Three redundant filter UIs plus a 4-category pill wall precede the actual content |
| 9 | Error Recovery | 3 | Empty state exists but gives no path back to a non-empty result set |
| 10 | Help and Documentation | 1 | No tooltip/legend for apparatus abbreviations (FNR, OEC, PC) despite students being a named audience |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** The apparatus SVG is genuinely product-specific — a thylakoid membrane diagram doubling as a spatial filter couldn't be dropped into an unrelated catalog unchanged, and it's the one element here with real personality. Everything downstream of it is generic faceted-search boilerplate: uppercase muted category labels, wrapped pill rows, a plain search input, an `auto-fill, minmax(220px,1fr)` card grid. `CardModel`'s 16px radius + lift/glow is a cosmetic `Card` variant, not a content-driven decision. Net: one strong specific idea, bolted onto an otherwise interchangeable filter-and-grid template that any dataset with categorical tags would produce.

**Deterministic scan:** Clean. One advisory-only finding, exit code 0, across all three scanned files:

```json
{
  "antipattern": "design-system-color",
  "file": "src/lib/components/CardModel.svelte",
  "line": 163,
  "snippet": "Undocumented color rgba(0, 0, 0, 0.7) is outside DESIGN.md colors",
  "severity": "advisory"
}
```

This is very likely a false positive: GreenSloth's own DESIGN.md documents this exact value in prose — "License badge: an optional bottom-left overlay pill (`rgba(0,0,0,0.7)` background, white text, 0.75rem)" — it's just not lifted into the frontmatter color token list the detector checks against. Real drift risk is near zero here; the detector caught nothing structural. This confirms Assessment A's read: the specificity gap on this page isn't token drift, it's an information-architecture problem (redundant filter mechanisms), which a mechanical scan can't see.

**Visual overlays:** Not available this run — no browser/screenshot tool is exposed in this environment, and `localhost` isn't reachable via the available fetch tool. Both assessments worked from source (`+page.svelte`, `ModelGallery.svelte`, `CardModel.svelte`, `ButtonTab.svelte`, all 22 `meta.ts` files) rather than a rendered page. Layout/contrast claims below are inferred from CSS, not observed pixels — worth a manual visual pass to confirm before treating them as settled.

## Overall Impression

The apparatus-scheme filter is a real idea — spatially mapping tag selection onto the actual thylakoid membrane is exactly the kind of product-specific touch this skill exists to protect, and it's the first thing a visitor sees. But it's surrounded by three more filter mechanisms doing overlapping work: a `ButtonTab` pill row duplicates the diagram's own tag category (with three orphaned tags the diagram can't express), plus separate pill rows for Model type, Explains data, and Organism (13 pills), plus a text search. A first-time visitor scans roughly 35 discrete controls before reaching the 22 models those controls are meant to help them find. The single biggest opportunity: let the apparatus diagram *be* the "Part of Photosynthesis" filter outright, cut the duplicate pill row, and give the page a visible "N of 22 shown / clear filters" state so the AND-only combination logic doesn't strand users at a silent zero-result screen.

## What's Working

- **The apparatus-as-filter concept.** Mapping tag selection onto the real thylakoid membrane location is legitimately delightful and on-brand for a photosynthesis research audience — nobody builds this for a generic catalog. It's the site's one unmistakably authored idea.
- **Keyboard shortcut interception.** `Ctrl/Cmd+F` and `/` focus the filter input directly, a small but real signal that someone thought about how a researcher actually works a long list rather than defaulting to mouse-only interaction.
- **Dev-gated validation toggle.** The validated-vs-unvalidated view is correctly kept behind `import.meta.env.DEV` — good judgment about what belongs in front of the production audience versus what's an internal QA aid.

## Priority Issues

**[P0] Redundant, semantically-inconsistent filter mechanisms for one category**
- **Why it matters:** The apparatus SVG and the "Part of Photosynthesis" `ButtonTab` row both write to the same `active["Part of Photosynthesis"]` state, stacked with no visual link drawn between them, and three of the twelve tags in that category (NPQ, Photorespiration, Proton motive force (pmf)) exist *only* as pills — the diagram can't express them. A user has no way to know two controls do the same job, or why some tags only live in one of them.
- **Fix:** Either drop the pill row for that category entirely and extend the diagram to cover the three orphan tags (a small "systemic effects" cluster), or visually merge diagram + pills into one clearly-labeled control with two views of the same filter.
- **Suggested command:** `/impeccable distill`

**[P0] `ButtonTab` pills carry no `aria-pressed` state**
- **Why it matters:** The apparatus toggles correctly set `aria-pressed={isActive(...)}`, but the far more heavily used `ButtonTab` component (Model type, Explains data, Organism, and the duplicate Part-of-Photosynthesis row) renders a plain `<button>` with only a CSS `.selected` class — no ARIA state at all. A screen-reader user gets full toggle semantics from the diagram and none from the pills doing most of the filtering work.
- **Fix:** Add `aria-pressed={selected}` to `ButtonTab` in the shared design package.
- **Suggested command:** `/impeccable audit`

**[P1] No "clear filters" control or active-filter summary**
- **Why it matters:** With AND-only, cross-category combination across up to ~35 possible tags, there's no way to see what's currently active or reset it except retracing every click manually. A student who forgot they toggled "Chlamydomonas reinhardtii" has no way to see that's why PSII returns zero models.
- **Fix:** Add a chip row above the grid showing active selections with individual and "clear all" dismissal — the standard faceted-search pattern, currently absent entirely.
- **Suggested command:** `/impeccable clarify`

**[P2] Organism facet needs restructuring, not just listing**
- **Why it matters:** 13 flat, unsorted pills mixing generic categories ("Generic C3 plant", "Theoretical") with specific species names is the single worst chunking violation on the page — well past the ≤4-per-group working-memory guideline.
- **Fix:** Alphabetize at minimum, split generic/theoretical entries from real species, or replace the pill wall with a searchable/typeahead control.
- **Suggested command:** `/impeccable layout`

**[P3] Empty state gives no recovery path**
- **Why it matters:** "No models match the current filters" doesn't say which filter is the blocker, leaving the user to guess or manually retrace clicks — compounds the P1 issue above.
- **Fix:** Name the offending category/tags in the empty-state copy, or surface a one-click "clear filters" inside the empty state itself.
- **Suggested command:** `/impeccable clarify`

## Persona Red Flags

**Jordan (First-Timer):** Lands on 9 diagram regions plus ~32 pills before seeing a single model card — the actual 22-model grid sits below the fold behind the entire filter apparatus, with no onboarding cue distinguishing "these are filters" from "this is the content."

**Sam (Accessibility-Dependent):** `ButtonTab` pills — used for Model type, Explains data, Organism, and the duplicate Part-of-Photosynthesis row — expose no `aria-pressed`/toggle semantics to assistive tech. The SVG apparatus does this correctly, which makes the inconsistency worse than a uniform gap: a screen-reader user filtering by Organism (13 options) has no way to know which pill is currently on.

**Riley (Stress-Tester):** Rapidly toggling apparatus + pills + text input simultaneously hits the AND-combination working-memory failure directly — three active filter types can silently produce a zero-result grid with no way to see which one caused it short of reading the DOM.

## Minor Observations

- `shortenTo(license, 35)` truncates license/journal text with `...` and no `title` attribute — truncated text is unrecoverable on hover or via screen reader.
- The `.copyright` badge (`rgba(0,0,0,0.7)` background, white text) sits over arbitrary scheme-image colors with no contrast check against lighter images — worth a manual check.
- `CardModel`'s fallback "biotech" Material Symbols glyph is the only card element not drawn from the apparatus/photosynthesis visual language — a generic biotech icon next to a custom thylakoid diagram reads as mismatched.
- The dev-only validation toggle is a sign the team already treats validation status as a first-class facet — worth promoting to the production audience once trust-signal placement (see Questions below) is settled, rather than leaving it dev-only indefinitely.

## Questions to Consider

- What if the apparatus diagram *was* the whole "Part of Photosynthesis" filter — no pill duplicate at all — and became the page's one flagship IA element instead of one of four parallel filter systems?
- What if "validated against source paper" (GreenSloth's stated differentiator) were a visible badge on every card, rather than a hidden dev-only toggle — wouldn't that do more for researcher trust than any filter mechanism?
- What if Organism became a typeahead instead of 13 flat pills — would the page's whole "look how much you can filter by" posture change once its worst offender is gone?
