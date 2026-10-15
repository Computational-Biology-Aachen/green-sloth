import { browser } from "$app/env";
import { resolve } from "$app/paths";
import {
  setWorkerBasePath,
  WorkerPool,
  type SimulationBackend,
} from "@computational-biology-aachen/mxlweb-core/workers";

import wasmWorkerUrlString from "@computational-biology-aachen/mxlweb-core/backends/wasm/wasmWorker.ts?worker&url";

// Must run before the first worker is created: every worker is handed this
// base path on __INIT__ to locate its Emscripten runtime under /wasm/.
setWorkerBasePath(resolve("/"));

const wasmWorkerUrl = browser
  ? new URL(wasmWorkerUrlString, import.meta.url)
  : new URL("http://localhost");

function once<T>(factory: () => T): () => T {
  let value: T | null = null;
  return () => {
    if (value === null) value = factory();
    return value;
  };
}

const getWasmPool = once(() => new WorkerPool(wasmWorkerUrl, 1));

/**
 * A fresh, caller-owned WASM worker pool — unlike the singleton above, not
 * memoized. Ensemble fitting (Fit.svelte, mxl-web ADR 0006 §2.5) needs N
 * preview trajectories computed in parallel, one per ensemble member, which
 * the shared `wasmRadau5` pool (hardcoded to size 1) would just serialize;
 * scoping a dedicated pool to the ensemble run's own lifetime (created when
 * it starts, `terminate()`d when it finishes or is cancelled) keeps every
 * other `wasmRadau5` consumer — single-model fitting included — unaffected.
 */
export function createWasmPool(size: number): WorkerPool {
  return new WorkerPool(wasmWorkerUrl, size);
}

export type Backend = SimulationBackend;

function makeWasmBackend(method: string, label: string): Backend {
  return {
    id: `wasm-${method}`,
    label: `WASM / ${label}`,
    method,
    getPool: getWasmPool,
    buildRequest(model, { derivedSelection } = {}) {
      const { allDerived, selectDerived } =
        model.buildJsDerived(derivedSelection);
      return {
        rhsWat: model.buildWat(),
        allDerivedFn: allDerived,
        selectDerivedFn: selectDerived,
        pars: model.resolveParameters(),
        parNames: model.getParameterNames(),
        method,
      };
    },
  };
}

export const wasmRadau5 = makeWasmBackend("radau5", "RADAU5");
export const wasmDop853 = makeWasmBackend("dop853", "DOP853");
export const wasmDopri5 = makeWasmBackend("dopri5", "DOPRI5");

export const allBackends: Backend[] = [wasmRadau5, wasmDop853, wasmDopri5];

export const backends = {
  wasmRadau5,
  wasmDop853,
  wasmDopri5,
};
