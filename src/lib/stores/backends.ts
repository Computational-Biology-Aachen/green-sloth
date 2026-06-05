import { browser } from "$app/environment";
import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import { WorkerPool } from "./workerPool";

import wasmWorkerUrlString from "@computational-biology-aachen/mxlweb-core/backends/wasm/wasmWorker.ts?worker&url";

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

type BuildOpts = {
  userParameters?: string[];
  derivedSelection?: string[];
};

type BackendRequest = {
  rhsFn?: string;
  rhsWat?: string;
  allDerivedFn: string;
  selectDerivedFn: string;
  pars: number[];
  parNames?: string[];
  method: string;
};

export interface Backend {
  id: string;
  label: string;
  method: string;
  getPool(): WorkerPool;
  buildRequest(model: KineticModelBuilder, opts: BuildOpts): BackendRequest;
}

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
