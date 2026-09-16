---
name: GreenSloth
description: Photosynthesis ODE model explorer — inherits the CPBL Design System verbatim, plus two local extensions
colors:
  primary: "rgb(0, 97, 101)"
  accent: "rgb(246, 168, 0)"
  chart-violet: "rgb(97, 33, 88)"
  chart-blue: "rgb(0, 84, 159)"
  chart-magenta: "rgb(227, 0, 102)"
  bg: "#f6f6f8"
  surface: "#ffffff"
  border: "#dde1e9"
  text: "#1a1d23"
  text-muted: "#727682"
  text-inverse: "#ffffff"
  ink: "rgb(15 23 42)"
  danger: "rgb(204, 7, 30)"
  sim-error: "#c0392b"
  sim-warning: "#e07b00"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: "normal"
  headline:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: "normal"
  title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "normal"
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
  icon:
    fontFamily: "Material Symbols Outlined"
    fontSize: "inherit"
    fontWeight: 400
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "1rem"
  full: "9999px"
spacing:
  space-1: "0.25rem"
  space-2: "0.5rem"
  space-3: "0.75rem"
  space-4: "1rem"
  space-6: "1.5rem"
  space-8: "2rem"
  space-12: "3rem"
  space-16: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.space-2} {spacing.space-6}"
  card-primary:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "2rem 2.5rem"
  card-model:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "0 0 0.75rem 0"
  nav-item:
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.space-2} {spacing.space-3}"
---

# Design System: GreenSloth

## Overview

**Creative North Star: "The Journal Figure" (inherited, unmodified)**

GreenSloth has no visual identity of its own. It consumes `@computational-biology-aachen/design` (`pkg-js/design` in this meta-repo — see that package's own [DESIGN.md](../../pkg-js/design/DESIGN.md) for the full, authoritative token and component reference) via `@import '@computational-biology-aachen/design/tokens.css'` and its Svelte component library, and every page in the site is built by composing those components: `Section`, `SectionHeader`, `Card`, `Button`, `H1`–`H6`, `Text`, `InfoBox`, `Accordion`, `ButtonMenu`, `ButtonTab`, `Table`, `Figure`, `LineChart`/`LineChartGrid`, and so on. This file exists to record where GreenSloth's own code diverges or adds to that system — not to restate it. Treat the design package's DESIGN.md as normative for anything not listed below; this file wins only for the two local extensions it documents.

The two genuine departures are both small, deliberate, and scoped:

1. **`CardModel`** (`src/lib/components/CardModel.svelte`) — a local fork of the shared `Card` used exclusively for the model gallery grid. It trades Card's 8px radius and scale-on-hover for a 16px radius, a lift-and-shadow hover, and a scheme-image/placeholder media area with an optional license badge.
2. **The interactive photosynthesis apparatus scheme** (`src/lib/features/modelGallery/ModelGallery.svelte`) — a hand-drawn SVG diagram of the thylakoid apparatus (PSII, Cytochrome b6f, PSI, ATP Synthase, OEC, CBB Cycle, FNR, PQ Cycle, PC) that doubles as a tag-filter control. It is the one place in the system where illustration color (biological, not brand) is deliberately used, and it is greyscale by default.

Two additional semantic colors — `sim-error` (`#c0392b`) and `sim-warning` (`#e07b00`) — exist only for simulation-failure UI (`SimErrDisplay`, `Sweep`'s warning state) and are not part of the shared design package; they're GreenSloth's own, added because the shared system has no warning color and only one generic danger color not wired into these components.

**Key Characteristics (all inherited — see design package):**

- Flat by default; lift is reserved for `Card` (and its `CardModel` variant here) as a signal of "distinct, interactive content."
- One accent color (Signal Orange), used sparingly.
- Space Grotesk throughout.
- The four ordered chart colors (petrol/violet/blue/magenta) are used correctly here — `LineChart`/`LineChartGrid` from the shared package render every model's time-course and PAM fluorescence plots with no local color override.
- Fast, single-speed motion (150ms) everywhere except `CardModel`'s hover, which is its own timing (see Components).

## Colors

The palette is the shared design package's palette, used as-is. See that file's Colors section for full role descriptions of Deep Petrol, Signal Orange, the chart series, and the neutral scale.

### GreenSloth-local additions (not in the shared package)

- **Sim Error** (`#c0392b`): left border, tinted background, and text color for `SimErrDisplay` — shown when a model's WASM/JS simulation throws or times out. Distinct from the shared package's `--color-danger` (`rgb(204, 7, 30)`, used by `InfoBox`'s error variant); this is a simulation-specific failure color, not a form/validation one.
- **Sim Warning** (`#e07b00`): `Sweep`'s warning text color for parameter-sweep results that completed with caveats.

### Named Rules

**The Series-Colors-Stay-In-Charts Rule** (inherited). Confirmed correctly followed: every chart in GreenSloth (`AnalysisChart` → `LineChart`/`LineChartGrid`) uses the shared package's chart colors and nothing else.

**The Illustration-Is-Not-Chrome Rule.** The apparatus scheme's fill colors (light blue OEC, greens for PSII/Cytb6f/PSI/FNR, orange ATP Synthase, purple PQ/PC, pink/salmon CBB Cycle arrows) are a biological-illustration palette, not design tokens — they are one-off per-shape hex values inside a single SVG, not reusable UI colors, and are exempt from the frontmatter for that reason (see Scan-mode pitfall: don't extract one-offs). Never reuse one of these hexes as a UI color elsewhere; if the apparatus needs a new organelle/complex, pick a color for legibility against the diagram, not from the RWTH brand palette.

## Typography

Inherited from the shared package: Space Grotesk everywhere, bold headings (`H1`–`H6`), 400 body, 500 labels. GreenSloth adds no typefaces, sizes, or weights of its own. Model reaction equations and parameter names render via KaTeX (`rehype-katex`/`remark-math`), which brings its own math-specific font metrics inside `.katex` — this is a necessary exception to "Space Grotesk everywhere" for mathematical notation only, not a second display face.

A second, narrower exception: `app.html` loads the **Material Symbols Outlined** icon font, used only for `CardModel`'s diagonal-gradient "biotech" fallback glyph when a model ships no scheme image. It is an icon font, not a text face — never use it for anything a human reads as words.

## Layout

Every page is a vertical stack of `Section` bands at the shared package's `--max-width` (1440px) or `width="narrow"` (100ch) for prose — no local deviation. Two page-specific layouts worth noting:

- **Model gallery** (`/models`): `Section` containing the apparatus scheme, then per-category tag facets (`ButtonTab` pills) — followed by a `Section` with the filter input and a `CardModel` grid (`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`, `gap: var(--space-6)`).
- **Model page** (`/models/[slug]`): a dark `SectionHeader` hero (title, DOI row, citation badge, edit-on-GitHub button) followed by `light`/`surface` `Section`s for the model's markdown description, reaction scheme figure, interactive dashboard (sliders + charts, `KineticModelDashboard`), parameter/variable tables, and curator notes.
- **Compare** (`/compare`): two `SectionHeader`-style column headers side by side (via `Row`) with synced-scroll diff lists below — no card grid, no charts; the one page in the system built as a structured diff view rather than Section-stacked content.

## Elevation & Depth

Inherited hybrid model (flat sections, lifted `Card`) with one addition: `CardModel` (below) uses its own shadow/hover recipe distinct from `Card`'s.

## Shapes

Inherited: `--radius-md` (8px) default for buttons/cards, `--radius-lg` (16px) for inputs. `CardModel` is the one component that uses `--radius-lg` on a card-shaped element rather than `--radius-md` — a deliberate, singular exception (see Components).

## Components

### Buttons, Inputs, Navigation, Sections

Unmodified — used exactly as documented in the shared design package.

### CardModel (local fork of Card)

- **Corner style:** `border-radius: var(--radius-lg)` (16px) — larger than the shared `Card`'s 8px, giving the gallery grid a softer, more image-forward feel than the flatter `Card`.
- **Structure:** a `media` block (scheme SVG/image at `object-fit: contain`, or a diagonal-gradient "biotech" icon placeholder when no scheme exists) above a `label` bar with the model's title.
- **License badge:** an optional bottom-left overlay pill (`rgba(0,0,0,0.7)` background, white text, 0.75rem) showing `license — journal` when present, truncated to 35 characters.
- **Hover:** `translateY(-3px)` plus a combined neutral + brand-glow shadow (`2px 5px 12px rgba(0,0,0,0.15), var(--shadow-primary)`) and the placeholder gradient shifts to full opacity — a lift-and-glow rather than the shared `Card`'s scale(1.03).
- **When to use vs. `Card`:** `CardModel` only, and only for the model gallery grid. Any other card-shaped content (publications, people, software) should use the shared package's `Card`/`CardPublication`/`CardPerson`/`CardSoftware` — don't extend this fork for unrelated content types.

### The apparatus scheme (signature component)

An interactive SVG diagram of the photosynthetic apparatus, functioning as a second, spatial way to filter the model gallery (alongside the text-facet `ButtonTab` pills below it — both control the same "Part of Photosynthesis" tag category).

- **Default state:** every apparatus part renders `filter: grayscale(1) opacity(0.5)` — desaturated and dimmed, so the diagram reads as a schematic reference rather than a call to action.
- **Selected state:** `filter: none` — full illustration color restores, matching the equivalent tag pill going active.
- **Hover:** partial desaturation lift (`grayscale(0.5) opacity(0.85)`; `brightness(0.95)` if already selected) on a plain `filter` transition, no transform — apparatus parts don't move or scale, only recolor.
- **Interaction:** each part is a keyboard-operable `role="button"` (Enter/Space), with a standard `outline: 2px solid var(--color-primary)` focus ring — accessible despite being raw SVG shapes, not real `<button>` elements.

**The Greyscale-Until-Selected Rule.** Any future filter control built as a diagram (rather than a text pill) should default to desaturated/dimmed and restore full color only on selection — color is reserved for "this is an active filter," exactly as it is here.

### Tag facets

Plain shared-package `ButtonTab` pills, grouped by tag category (`Part of Photosynthesis`, `Model type`, `Explains data`, `Organism`, …), each category labeled with a small uppercase, letter-spaced, muted-color header (`0.85rem`, `--weight-semibold`, `0.05em` tracking, `text-transform: uppercase`) — a GreenSloth-local label treatment not otherwise present in the shared package's typography scale (it sits between `label` and `Small`).

### Citation badge (model page hero)

A small pill on the dark `SectionHeader` hero (`border-radius: 999px`, `rgba(255,255,255,0.15)` background, `rgba(255,255,255,0.9)` text, `0.75rem`) showing live citation-count state fetched client-side; a `--loading` variant dims text to `rgba(255,255,255,0.5)`. Same pill shape as `--radius-full` (9999px) but built with inline rgba rather than the shared token, since it sits on an arbitrary dark hero background rather than a fixed surface color.

## Do's and Don'ts

### Do:

- **Do** treat `pkg-js/design`'s DESIGN.md as the source of truth for every token, component, and rule not listed here — re-read it before any visual work on GreenSloth, don't re-derive tokens from this project's rendered CSS.
- **Do** use `LineChart`/`LineChartGrid` (and their fixed chart-series colors) for every model plot — never hand-roll a chart color.
- **Do** keep `CardModel` scoped to the model gallery; use the shared `Card` family everywhere else.
- **Do** default any new diagram-based filter control to greyscale/dimmed, restoring color only on selection (**The Greyscale-Until-Selected Rule**).

### Don't:

- **Don't** promote the apparatus scheme's illustration colors to design tokens or reuse them as UI chrome (**The Illustration-Is-Not-Chrome Rule**).
- **Don't** fork another shared component the way `CardModel` forks `Card` without a real, page-specific reason — the two existing forks in this design family (`CardModel` here, `LineChart` in `pages/mxl-web`) are each justified by a documented gap in the shared package, not a taste preference.
- **Don't** add a third simulation-status color without checking `sim-error`/`sim-warning` first — they already cover the failure/caveat cases.
