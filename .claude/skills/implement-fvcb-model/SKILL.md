---
name: implement-fvcb-model
description: Implement the next steady-state FvCB-family model from tmp/to-implement.md in green-sloth, one model per run, with every model-output figure of the original paper replicated (validation.ts checked against the paper; validation.ipynb exported from green-sloth as a test of the notebook export). Use when the user says "next FvCB model", "implement the next model from to-implement", "/implement-fvcb-model", or names a to-implement entry (slug or DOI) to do.
---

# Implement the next FvCB-family model

One run = paper pre-flight for the upcoming models, then **exactly one** model implemented, verified, committed locally, and stop. The user reviews between runs.

Optional argument: a slug or DOI to do instead of the next one in order.

Paths (relative to green-sloth = `/home/marvin/git/0-admin/pages/green-sloth`):

- Work list: `tmp/to-implement.md` (gitignored, local only)
- Papers: `tmp/papers/` (gitignored)
- Models: `src/lib/models/<slug>/`
- Mechanism page: `src/lib/mechanisms/fvcb-family/{meta.ts,page.md}`
- Notebook export: `scripts/export-validation.ts` (green-sloth) and `e2e.validation_export` (mxl-e2e)

**What is the reference for what.** None of these models has an independent Python implementation, so the **paper is the only correctness reference**: its figures, its printed values and the equation audit (§7). Don't hand-write a numpy re-implementation as a "reference". It would only compare two things you wrote. The exported `validation.ipynb` and the goldens frozen from it test something else: the **notebook export and the two engines** (TS engine vs MxlPy running the export). They don't test the model.

## 0. Orient (every run)

1. Read the **Lessons** section at the bottom of this file.
2. Read `tmp/to-implement.md`. Done entries are `- [x]`, skipped ones `- [~]`.
3. `git status` in green-sloth and in `misc/mxl-e2e`. If either has unrelated uncommitted changes, stop and ask.
4. Reference implementations to mirror (read the ones closest to the new model):
   - `june2004`: the cleanest `validation.ts` (scans, styled plots, golden keys). Its `validation.ipynb` is an older hand-written one, so don't copy that.
   - `harley1992`: closed-form stomatal coupling (Ball–Berry as a quadratic)
   - `bernacchi2013`, `bernacchi2001`: temperature functions, and fitting the parameters the paper doesn't print
   - `fvcb1980`: the base equations (it only has static figs; don't copy its validation style)

## 1. Pick the model

Go through the **Suggested order** at the bottom of to-implement.md, slotting in the section-9 add-ons where it says ("with step 1: …"). When that list is done, take the remaining entries by priority (high → medium → low) in document order.

Classify the candidate before doing anything else:

- **Model:** new equations, or a new parameterisation that has model-output figures to replicate. Implement it.
- **Cross-check only:** a review or "read" entry (Yin 2021, Busch 2020 review, von Caemmerer 2013, Rogers 2017, Bernacchi 2026). Don't make a page for it. Use it as a reference when implementing related models, and tick it once it has been used.
- **Skip:** commentary, methods-only or data-only papers with no new model. Mark it `- [~] skipped: <one-line reason>` and move to the next candidate.
- **C₄ (section 8 and the C₄ entries of 9a/9b):** not yet. Skip without marking, and tell the user when only C₄ entries are left.
- **Dynamic/ODE** (e.g. Deans 2019): out of scope here. Mark it `[~]` with the reason.

Slug: `firstauthorYEAR` in lowercase (e.g. `ethier2004`, `busch2013`). If the slug is already taken, add a suffix and ask. Use the year of the volume, not the online date. Check that the slug matches the row `id` in `fvcb-family/meta.ts` if a row exists.

## 2. Paper pre-flight

For the chosen model **and the next ~4 in order**, check `tmp/papers/` for the PDF (and the supplement where the figures or parameters live there).

For each missing PDF, look in **legal open-access sources only**: the Unpaywall API (`https://api.unpaywall.org/v2/<doi>?email=…` needs an email, so ask the user for permission before using theirs, or use Crossref's `link` field), Europe PMC / PMC, the publisher's OA version, and author or institutional repositories (ANU Open Research, florianbusch.org, WUR eDepot, OSTI for Oak Ridge). No shadow libraries.

- Download each file into its own new directory first, check that it really is the paper (title and DOI on page 1), then move it to `tmp/papers/<slug>.pdf` (and `<slug>-si.pdf`).
- Report, as one list, every PDF in the window that is still missing, with its DOI and title, so the user can supply them in one go.
- **If the chosen model's PDF is missing, stop here.**

## 3. Read the paper

- Read the whole PDF with the Read tool (`pages:` for long ones). Render each figure page as an image to look at it: `pdftoppm -r 150 -f N -l N -png in.pdf out` into the scratchpad.
- Write down for yourself:
  - every equation, with its number and notation
  - every parameter value, with its units, source (table or text) and the species or condition it applies to
  - the list of figures and tables, each marked as model output or as data/schematic
- **Parameter completeness:** for every model-output figure, check that every parameter it needs is printed. If some are missing, fit them, in a scratchpad script, to values read off the figure (as bernacchi2001 Fig 3 and bernacchi2013 do) and document them in curatornotes.md.
- **Closed form:** the `SteadyStateModelBuilder` only evaluates explicit assignments. If the paper iterates or solves implicitly (Ci from Ca, Cc with finite gm, coupled stomata), derive the closed form (usually a quadratic, as in Ethier & Livingston, or Harley's Ball–Berry). Check it in a scratchpad script against a numeric root-find (`scipy.optimize.brentq`). Choose the physically meaningful root explicitly and document which one it is. **If no exact closed form exists, stop and propose options** (an approximation, ODE relaxation, a new mxlweb-core feature). Don't choose one on your own.
- Cross-check the notation against Yin et al. 2021 (PCE 44: 2811) or von Caemmerer 2013 if they are available. Where the paper's notation conflicts with them, keep the paper's.

## 4. Implement

Create `src/lib/models/<slug>/` and mirror the reference models' file structure:

- `model.ts`: hand-written `SteadyStateModelBuilder` using only `@computational-biology-aachen/mxlweb-core` (+ `/mathml`). **Self-contained**: no shared helpers, and the paper's own notation and equation numbers in comments. Inputs that people will scan (Ci/Ca, PPFD, T_leaf, O, gm, …) are parameters with sliders. Every output a figure needs is an assignment. Default parameter values are those of the paper's main figure or table, and a comment says which.
- `meta.ts`: `ModelMeta` with slug, title, journal, license, DOI, tags (`"Model type": ["Steady State"]`, organism) and `sweep` analyses for the paper's main responses (A–Ci, A–PPFD, A–T as applicable). Add the contributor entry (marvinvanaalst, this month).
- `model.md`: two short paragraphs: what the model adds to FvCB, and its scope and organism, with a DOI link.
- `validation.ts`: every model-output figure as `Validation[]` data (scans over the inputs, `simulate: { kind: "steadyState" }`, plots styled like the paper's: axis ranges, labels, line styles), and a `golden` map per figure that names the series to lock (`tolerance: 1e-9`, since no solver is involved).
- `curatornotes.md`: which figures were reproduced, which were skipped and why, fitted or assumed parameters, root choices, and any residual offsets with their explanation.
- Do the fitting and closed-form root-checks from §3 as throwaway scripts in the scratchpad. They are working notes, not committed references.
- **`validation.ipynb`: generated, never hand-written.**
  ```bash
  npx vite-node scripts/export-validation.ts <slug> src/lib/models/<slug>/validation.ipynb
  # mxl-e2e's env has the local MxlPy (path dependency)
  uv run --project ../../misc/mxl-e2e --with nbconvert,ipykernel \
      jupyter nbconvert --to notebook --execute --inplace src/lib/models/<slug>/validation.ipynb
  ```
  It must run end to end, without edits. If the export fails, produces invalid Python, or can't express something `validation.ts` uses, that is an **export bug**. Fix it in `src/lib/validation/export/mxlpy.ts` (or the MxlPy/mxlweb-core codegen it calls) as its own `fix(validation-export): …` commit, if the fix is small and clearly right. Otherwise stop and report it. Never patch the generated notebook by hand.
- `figs/<id>.svg`: the exported notebook's figures, one per validation, in order:
  ```bash
  cd src/lib/models/<slug> && uv run --project ../../../../../../misc/mxl-e2e \
      python ../../../../.claude/skills/implement-fvcb-model/savefigs.py validation.ipynb figs <validation ids...>
  ```
  These are the images you compare against the paper in §5.

## 5. Replicate: compare against the paper

For **every model-output figure and table**, put the exported notebook's figure (rendered to PNG) next to the paper's figure. Compare by eye: axes, curve shapes, which limitation is active where, transition points, and values. Check every number printed in the text or tables (e.g. "refixation raises A by 8–11 %") with a quick computation. Also open the model page in the site (`npm run dev`) once, to check that the site's own rendering of `validation.ts` looks the same.

- A small offset that can be explained (digitisation, a rounded parameter, an unstated constant) is fine, as long as it is documented in curatornotes.md.
- A clear mismatch: first re-check the equations, units (Pa vs µmol mol⁻¹, °C vs K, per-leaf vs per-chloroplast), parameter sets, and which root was taken. **If it is still unexplained, stop and show the user both images.** Never accept it silently.

## 6. Export test, goldens and gates

The goldens lock the cross-engine agreement. They don't encode correctness. Freeze them from the executed export, then hold the TS engine to them:

```bash
echo '{}' > src/lib/models/<slug>/validation.golden.json     # new models only
cd ../../misc/mxl-e2e
uv run python -m e2e.validation_export <slug> --freeze <fig ids from validation.ts ...>
uv run python -m e2e.validation_export <slug>                # exported notebook == goldens
cd -
# TS engine == goldens (`npm run test:validation` ignores a slug argument)
VALIDATE_MODELS=<slug> npx vitest run tests/validation.test.ts --reporter=verbose --silent=false
```

If the TS engine and the exported MxlPy notebook disagree beyond rounding, the cause is an export or engine bug, not a model bug. Find out which side is wrong: compare against the paper, and evaluate a single point by hand from the closed form. Fix it as above, or stop and report it. Don't loosen tolerances to hide it.

Gates (all must pass) in green-sloth:

```bash
npm run generate:mxl            # writes model.mxl.json, parity-gated
npm run validate:models
npm run check
npm run lint
npx prettier --write <touched files only>   # NEVER repo-wide `npm run format`
```

In mxl-e2e, only if you changed it: `uv run pytest`, `uv run ruff format`, `uv run ruff check --fix`.

## 7. Independent equation audit

Spawn **one** `general-purpose` subagent. Give it only: the PDF path(s), the paths of `model.ts`, `validation.ts` and `curatornotes.md`, and this brief: "Check every equation, parameter value, unit and default against the paper; list discrepancies with equation/table numbers and file:line. Don't trust comments in the code." Don't give it your own reasoning. For each finding, either fix it (and re-run the gates) or justify it in curatornotes.md.

## 8. Bookkeeping

- `tmp/to-implement.md`: change `- [ ]` to `- [x]` and add the slug to "Already in green-sloth".
- `fvcb-family/meta.ts`: add `slug: "<slug>"` to the model's row (create the row if there isn't one). Correct its `choices` / `buildsOn` / `branch` wherever the paper says otherwise.
- `fvcb-family/page.md`: update the prose if it describes this model or should now link to it.
- **Lessons** (below): add any reusable gotcha found during this run (a closed-form trick, a notation pitfall, a units trap, a tooling quirk). Keep each one to a line or two, and don't record model-specific trivia.

## 9. Commit (local, `main`, no push)

Use the `commit` skill in green-sloth (`feat(models): add <slug>`, with any export fix as its own earlier commit), and in `misc/mxl-e2e` only if it changed. **Never push**, and don't bump the 0-admin submodule pointers. The user pushes or syncs.

Then report: the model that was done, the figures reproduced or skipped, any fitted parameters, the audit findings and how they were resolved, the commits, and the PDFs still missing for the next models.

## Stop conditions (summary)

Stop and wait for the user when:

- the chosen model's PDF can't be found legally
- there is no exact closed form
- a figure mismatch remains unexplained
- the notebook export or the TS engine vs MxlPy check fails, and the fix isn't small and clearly right
- the working tree has unrelated changes
- only C₄ entries are left

## Lessons

<!-- Append reusable gotchas here, one bullet each, newest last. -->

- Paper lookup: the OpenAlex API (`api.openalex.org/works/doi:<doi>`, no email needed) lists every OA location at once. Wiley "bronze" OA (`…/doi/pdfdirect/…`) returns a bot-challenge HTML page to curl. ANU Open Research (DSpace 7) bitstreams return 401 via `/server/api/core/bitstreams/<id>/content` when they are request-a-copy only. In both cases, ask the user to download the file in a browser.
- `displayName` becomes the Python identifier in the MxlPy export, so it must be a plain identifier (use the id); put pretty names in `texName`.
- `npm run generate:mxl` rewrites every model's `model.mxl.json`, and can produce unrelated number-format churn (e.g. zaks2012 `6.022e23` → `6.022e+23`). Revert anything outside the new model before committing.
- When a figure's curves come from separate per-condition fits, use those per-fit values (often the points of a companion figure), not the pooled table. In ethier2004, Fig 8 matched only with the Fig 9 points, not with Table 3.
- Before fitting unprinted parameters to a figure, re-run the paper's own regression on its synthetic data. If it recovers the printed values, your reading of the setup is right.
- A Fig 9-style lockstep scan (several parameters varying together), or a one-point scan, needs an explicit `x` in the `Scan`. Otherwise x falls back to the first column, or the scan fails with "A scan without a varying column needs `x`".
- Re-derive every printed closed form from its substitution, and test the chosen root against `brentq` on the implicit equation, not against the printed coefficients: von Caemmerer 2009's Eqns 9.28/9.29 print `+ Rd` where the derivation gives `− Rd`.
- When a figure says "parameters of Table X" but sits a constant offset off, try the table's alternative (bracketed, footnoted) values before fitting: fvcb2009 Fig 9.5 is drawn with Table 9.1's bracketed Γ*.
- Digitising: at 400 dpi, find the frame (long dark rows/columns) and the inner ticks programmatically, then read curves as dark-pixel clusters per pixel column. That gives about 0.05 axis units, enough to tell a parameter offset from a reading error.
- The mxl-e2e notebook check matches goldens by nearest x, so a series whose points share one x (a vertical drop line) fails right after freezing. Leave such a presentational series out of `golden`.
- Read the paper before trusting its to-implement.md description: busch2013 was listed as "the base model" but is a measurement paper. Classify it from its figures (model output or data), not from the summary.
- Panels that fit a regression to a scan of model output (e.g. farquhar2017's two-line Kok fits) aren't expressible in `validation.ts`. Check them in a scratch script, and document them as left out.
- The site's sweep charts clip y at 0 unless `yMin` is set. Any analysis with negative values (A below the compensation point) needs an explicit `yMin`.
- Before trusting a caption's "parameters of Fig X", fit the effective rate per curve to the scan: harley1991 Figs 3–5 say "Fig 2C" but are drawn with cotton's R = 56.7. A printed "R" or "Pml" may be the light-saturated rate, which only matches with a light response (harley1991: Harley 1992's α = 0.24 at the measurement PFD).
- An implicit Wp that depends on vo (glycerate re-entry) is linear in vc once vo = Φ vc, with Φ = O/(τC) depending only on C and O, so no iteration is needed.
- The notebook export dropped `markEvery` until harley1991. Check that every SeriesStyle field a validation uses actually reaches `styleKwargs` in `export/mxlpy.ts` (`alpha` and `zorder` still don't).
