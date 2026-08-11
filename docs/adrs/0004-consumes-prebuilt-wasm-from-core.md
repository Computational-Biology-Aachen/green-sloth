# ADR 0004: Consume mxlweb-core's Prebuilt WASM, Don't Rebuild Locally

**Status:** Implemented
**Scope:** Vite plugin serving/copying `mxlweb-core`'s `static/wasm` assets

---

## 1. Context

The WASM Radau5 runtime (`radau5.js`/`.wasm`) requires Emscripten to build (see
`mxlweb-core`'s `npm run build:wasm`, which shells out to `emcc`). GreenSloth does not
build this itself — `mxlweb-core` ships the compiled artifacts prebuilt under its own
`static/` directory, and a small Vite plugin in this repo serves them in dev and copies
them into the static build output.

## 2. Decision

Treat `mxlweb-core`'s WASM build as a prebuilt artifact to consume, not something
GreenSloth's own build pipeline reproduces.

## 3. Rationale

Emscripten is a heavy, non-trivial build dependency (a full LLVM-based toolchain) that
consumer sites shouldn't need just to run a site that *uses* the solver — only
`mxlweb-core` itself, where the C source lives and changes, needs it. Every site
built on `mxlweb-core` would otherwise duplicate an Emscripten setup for a build step
whose output changes only when `mxlweb-core`'s WASM source changes, not per-site.

## 4. Consequences

- If `mxlweb-core`'s WASM build changes, this site picks it up via its normal dependency
  update — no local rebuild step required or possible.
- Don't add Emscripten to this site's toolchain "for completeness" — it's deliberately
  out of scope here.
