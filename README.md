# GreenSloth

![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

Interactive explorer for photosynthesis ODE models. All compute is client-side — no server required. SvelteKit 5, adapter-static. Deployed at `/green-sloth`.

Ships several published photosynthesis models (Matuszyńska 2016 NPQ, Matuszyńska 2019, Davis 2017, Li 2021), each with a dashboard, time-course plots, and PAM fluorescence protocols, plus a route to compare models side by side.

Model building and the compute backends (including the WASM RADAU5 solver) come from the shared [`@computational-biology-aachen/mxlweb-core`](https://github.com/Computational-Biology-Aachen/mxlweb-core) package. The Emscripten WASM runtime (`radau5.js`/`.wasm`) is **not** built here — `mxlweb-core` ships it prebuilt under its `static/` dir, and a small Vite plugin serves it in dev and copies it into the static build (no local `build:wasm` needed).

## Dev

```bash
npm install
npm run dev          # dev server on :5173
npm run build        # static build → build/
npm run preview      # preview the build
npm run check        # TypeScript + Svelte type checking
npm run format       # auto-format with Prettier
npm run lint         # ESLint check
```

## Tool family 🏠

`GreenSloth` is part of a larger ecosystem:

- [mxlweb-core](https://github.com/Computational-Biology-Aachen/mxlweb-core) — shared model-building and compute engine powering this site
- [design](https://github.com/Computational-Biology-Aachen/design) — shared CPBL design system: tokens + Svelte components
- [MxlWeb](https://github.com/Computational-Biology-Aachen/mxl-web) — browser-side ODE model explorer
- [MxlPy](https://github.com/Computational-Biology-Aachen/MxlPy) — Python package for mechanistic learning
- [MxlBricks](https://github.com/Computational-Biology-Aachen/mxl-bricks) — pre-defined reaction bricks on top of MxlPy
- [MxlModels](https://github.com/Computational-Biology-Aachen/mxl-models) — flat single-file model versions for easy inspection
- [pysbml](https://github.com/Computational-Biology-Aachen/pysbml) — SBML import/export for MxlPy
- [Parameteriser](https://gitlab.com/marvin.vanaalst/parameteriser) — kinetic parameter lookup from BRENDA and other databases
  
## How to cite

**GreenSloth: a curated database and executable platform for mechanistic photosynthesis models.** Elouen Corvest, Marvin van Aalst, Tim Nies, Quang Huy Nguyen, Josha Ebeling, Maja Strauch, El-Hadji Malick Cisse, Tanvir Hassan, Anna Matuszyńska. *bioRxiv* (2026), 2026.07.22.740007. https://doi.org/10.64898/2026.07.22.740007
