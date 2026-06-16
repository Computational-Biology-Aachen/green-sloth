# Contributing a model to GreenSloth

GreenSloth ships curated photosynthesis ODE models, each fully simulated client-side. This guide covers how to add one **today**.

> [!NOTE]
> The current path is **code-based** — a model is a small TypeScript folder. We plan to move to a **data-first** format (SBML / `.mxl.json` + JSON metadata) so models can be contributed as data and validated automatically; see [#8](https://github.com/Computational-Biology-Aachen/green-sloth/issues/8). Until that lands, follow the steps below.

## What a model is

Models are auto-discovered: drop a folder under `src/lib/models/<slug>/` and it registers itself — `src/lib/models.ts` globs `models/*/model.ts` and `models/*/meta.ts`, no central list to edit. A model appears in the site only when it has **both** `model.ts` and `meta.ts`.

```
src/lib/models/<slug>/
  model.ts      # builds the KineticModelBuilder  (the model itself)
  meta.ts       # title, DOI, tags, dashboard analyses
  model.md      # prose description shown on the model page
  comment.md    # short validation note
  scheme.svg    # reaction scheme diagram
```

Pick a `<slug>` like `authoryear` (e.g. `matuszynska2016_npq`); it must match the `slug` field in `meta.ts`.

## 1. `model.ts` — the model

Export an `initModel()` that returns a `KineticModelBuilder` from `@computational-biology-aachen/mxlweb-core`. Rate laws are written as MathML AST nodes imported from `@computational-biology-aachen/mxlweb-core/mathml`.

```ts
import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Mul,
  Name,
  Num,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("k", { value: 0.1, texName: "k" })
    .addVariable("A", { value: 1.0, texName: "A" })
    .addReaction("v1", {
      fn: new Mul([new Name("k"), new Name("A")]),
      stoichiometry: [{ name: "A", value: new Num(-1.0) }],
      texName: "v\\_1",
    });
}
```

Builder methods (`addParameter`, `addVariable`, `addAssignment` for derived quantities, `addReaction`): see the existing models under `src/lib/models/` — [`matuszynska2016_npq`](src/lib/models/matuszynska2016_npq/model.ts) is a good, complete reference.

Writing all the MathML AST by hand is the tedious part. **If you already have the model elsewhere, don't — generate it instead (see below).**

## 2. `meta.ts` — presentation metadata

```ts
import { defaultPamProtocol } from "$lib/models/pamProtocols";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "authoryear",
  title: "Author Year, Journal",
  DOI: "10.xxxx/xxxxx",
  tags: {
    "Part of Photosynthesis": ["PSII", "PQ Cycle"],
    Demonstrations: ["PAM Simulation"],
  },
  analyses: [
    { type: "timecourse", title: "Time course", tEnd: 100, nTimePoints: 500 },
    {
      type: "pam",
      title: "PAM fluorescence",
      ppfdKey: "PPFD",
      fluoKey: "Fluo",
      pamProtocol: defaultPamProtocol,
      variables: ["Fluo"],
      nTimePoints: 100,
    },
  ],
};
```

The full `ModelMeta` / analysis options (plot layouts, normalization, timeouts) are documented in `src/lib/types.ts`.

## 3. `model.md`, `comment.md`, `scheme.svg`

- **`model.md`** — a couple of paragraphs: what the model describes, what it's good for, the organism, the key reference (link the DOI).
- **`comment.md`** — one line on how the model was validated (e.g. reproduces figure N of the paper).
- **`scheme.svg`** — a diagram of the reaction scheme.

## 4. Verify and submit

```bash
npm install
npm run check     # TypeScript + Svelte type checking
npm run lint      # ESLint + Prettier
npm run dev       # open the model page, confirm the analyses run
```

Then open a PR against [`green-sloth`](https://github.com/Computational-Biology-Aachen/green-sloth).

---

## Shortcuts if you already have the model

You usually don't need to hand-write `model.ts`.

### a) You have an [mxlpy](https://github.com/Computational-Biology-Aachen/mxlpy) model

mxlpy has codegen for mxlweb. `generate_model_code_mxlweb` emits the exact `KineticModelBuilder` TypeScript you'd otherwise write by hand:

```python
from mxlpy.meta import generate_model_code_mxlweb

ts_source = generate_model_code_mxlweb(
    model,
    tex_names={"vx": "V_x"},                       # optional LaTeX display names
    sliders={"PPFD": {"min": "0", "max": "1000", "step": "10"}},  # optional
    docstring="Author et al. (Year) — ...",        # optional
)
# write ts_source to src/lib/models/<slug>/model.ts
```

The output is a drop-in `model.ts`. You still write `meta.ts` and the markdown/SVG by hand.

### b) You have an SBML model

Two options:

- **Via mxlpy** (recommended if you also want to tweak the model): read SBML to a model, then codegen as in (a):

  ```python
  from mxlpy import sbml
  from mxlpy.meta import generate_model_code_mxlweb

  model = sbml.read("model.xml")
  ts_source = generate_model_code_mxlweb(model)
  ```

- **Directly in JS/TS**: `mxlweb-core` converts SBML to a builder without going through Python:

  ```ts
  import { sbmlToModel } from "@computational-biology-aachen/mxlweb-core/sbml";

  const builder = sbmlToModel(sbmlXmlString);
  ```

  You can use this in a one-off script to emit `model.ts`, or — once [#8](https://github.com/Computational-Biology-Aachen/green-sloth/issues/8) lands — ship the SBML directly as data.

> Whichever shortcut you use, run `npm run dev` and confirm the model simulates and the dashboard analyses look right before opening a PR.
