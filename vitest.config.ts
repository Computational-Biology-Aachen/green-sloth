import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Standalone on purpose: without this file vitest would load vite.config.ts,
// whose SvelteKit and mxlweb-core-static plugins do build work (e.g. copying
// wasm into .svelte-kit/output) that unit tests don't need.
export default defineConfig({
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
