import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { existsSync } from "fs";

// In the meta-repo, resolve the workspace packages from source for live edits;
// standalone installs fall back to the published package via its exports map.
const designSrc = new URL("../design/src/lib", import.meta.url).pathname;
const coreSrc = new URL("../../pkg/mxlweb-core/src", import.meta.url).pathname;
const workspaceAlias = {
  ...(existsSync(designSrc)
    ? { "@computational-biology-aachen/design": designSrc }
    : {}),
  ...(existsSync(coreSrc)
    ? { "@computational-biology-aachen/mxlweb-core": coreSrc }
    : {}),
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
    runes: ({ filename }) =>
      filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
  },
  kit: {
    alias: workspaceAlias,
    adapter: adapter({
      pages: "build",
      assets: "build",
      precompress: false,
      strict: true,
    }),
    paths: {
      base: process.argv.includes("dev") ? "" : "/green-sloth",
    },
    version: {
      // Poll for new deploys so long-lived tabs upgrade proactively instead of
      // only recovering reactively after a failed navigation.
      pollInterval: 300_000,
    },
  },
  preprocess: [vitePreprocess()],
  extensions: [".svelte", ".svx", ".md"],
};

export default config;
