/**
 * The validation engine's `simulate`, on a WASM worker pool owned by one run.
 * Cancelling terminates the workers, which is the only way to stop a solve.
 */
import {
  WorkerPool,
  type SimulationResult,
} from "@computational-biology-aachen/mxlweb-core/workers";
import { createWasmPool } from "../stores/backends";
import type { Simulate, SimulateResult } from "./run";

export interface ValidationPool {
  simulate: Simulate;
  concurrency: number;
  terminate(): void;
}

export function createValidationPool(): ValidationPool {
  const concurrency = Math.min(navigator.hardwareConcurrency ?? 2, 4);
  const pool = createWasmPool(concurrency);
  const pending = new Map<
    string,
    { resolve(r: SimulateResult): void; reject(e: Error): void }
  >();
  let terminated = false;
  const rejectAll = (message: string) => {
    for (const { reject } of pending.values()) reject(new Error(message));
    pending.clear();
  };

  pool.onMessage((data: SimulationResult) => {
    const id = data.requestId;
    if (id === undefined) return;
    pending.get(id)?.resolve(data);
    pending.delete(id);
  });
  pool.onError(() => rejectAll("A simulation worker crashed"));

  return {
    concurrency,
    simulate: (req) =>
      new Promise((resolve, reject) => {
        if (terminated) {
          reject(new Error("Cancelled"));
          return;
        }
        const requestId = WorkerPool.generateRequestId();
        pending.set(requestId, { resolve, reject });
        pool.postMessage({ ...req, requestId });
      }),
    terminate() {
      terminated = true;
      pool.terminate();
      rejectAll("Cancelled");
    },
  };
}
