import {
  compileModelNode,
  loadRadauNode,
} from "@computational-biology-aachen/mxlweb-core/backends/wasm/node";
import { simulate } from "@computational-biology-aachen/mxlweb-core/backends/wasm/simulate";
import type { Simulate } from "../../src/lib/validation/run";

/** The real WASM backend, headless. One module runs one simulation at a time. */
export async function nodeSimulate(): Promise<Simulate> {
  const mod = await loadRadauNode();
  return (req) => simulate(mod, req, (wat) => compileModelNode(wat, mod));
}
