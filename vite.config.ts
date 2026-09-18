import { cpSync, existsSync, readdirSync, readFileSync } from "fs";
import { createRequire } from "module";
import { dirname, extname, join } from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";
import wasm from "vite-plugin-wasm";

const require = createRequire(import.meta.url);
const coreStatic = join(
  dirname(
    require.resolve("@computational-biology-aachen/mxlweb-core/package.json"),
  ),
  "static",
);

// In the meta-repo, svelte.config.js aliases the design package to its
// source under ../../pkg-js/design/src/lib for live edits (see workspaceAlias
// there). That makes imports resolve relative to ../../pkg-js/design, so a
// package it depends on (e.g. katex, for its fonts) can resolve to
// ../../pkg-js/design's own nested node_modules rather than this project's —
// which SvelteKit's dev server doesn't allow serving from by default. Allow
// it explicitly when present.
const designNodeModules = new URL(
  "../../pkg-js/design/node_modules",
  import.meta.url,
).pathname;
const designSrc = new URL("../../pkg-js/design/src/lib", import.meta.url)
  .pathname;

const MIME: Record<string, string> = {
  ".js": "application/javascript",
  ".wasm": "application/wasm",
};

// The wasm RADAU5 backend loads its Emscripten runtime (radau5.js/.wasm) at
// runtime from `<base>/wasm/`. mxlweb-core ships those prebuilt under its
// `static/` dir; serve them in dev and copy them into the client build so
// adapter-static emits them. No local `build:wasm` needed.
function serveAndCopyCoreStatic(): Plugin {
  return {
    name: "mxlweb-core-static",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const filePath = join(coreStatic, url);
        try {
          const content = readFileSync(filePath);
          res.setHeader(
            "Content-Type",
            MIME[extname(filePath)] ?? "application/octet-stream",
          );
          res.end(content);
        } catch {
          next();
        }
      });
    },
    closeBundle() {
      if (this.environment?.name !== "client") return;
      const wasmSrc = join(coreStatic, "wasm");
      const wasmDest = join(".svelte-kit", "output", "client", "wasm");
      const files = readdirSync(wasmSrc).filter((f) => f !== ".gitkeep");
      cpSync(wasmSrc, wasmDest, {
        recursive: true,
        filter: (f) => !f.endsWith(".gitkeep"),
      });
      this.warn?.(`copied ${files.length} wasm files → ${wasmDest}`);
    },
  };
}

export default defineConfig({
  plugins: [sveltekit(), wasm(), serveAndCopyCoreStatic()],
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: [
      "@computational-biology-aachen/design",
      "@computational-biology-aachen/mxlweb-core",
    ],
    // mxlweb-core statically imports ajv/dist/2020.js (CJS). Because
    // mxlweb-core itself is excluded above (so live-linked source edits
    // aren't stale-cached), Vite never crawls into it to auto-discover
    // that import, so ajv is never pre-bundled/converted to ESM and the
    // dev server tries to serve raw CJS as a native ES module. Force it
    // in explicitly instead.
    include: ["ajv", "ajv/dist/2020.js"],
  },
  server: {
    port: 5177,
    strictPort: true,
    fs: {
      allow: existsSync(designSrc) ? [designNodeModules] : undefined,
    },
  },
});
