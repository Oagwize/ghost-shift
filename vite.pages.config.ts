import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// @ts-expect-error JS plugin alongside the TS vite config
import { appEnvPlugin } from "./scripts/app-env-plugin.mjs";

/**
 * GitHub Pages sample build. Does not change the 8080 live-preview contract.
 * Run: npx vite build --config vite.pages.config.ts
 */
export default defineConfig({
  base: "/ghost-shift/",
  resolve: { tsconfigPaths: true },
  plugins: [
    appEnvPlugin(),
    tailwindcss(),
    tanstackStart({
      spa: { enabled: true },
      router: { basepath: "/ghost-shift" },
    }) as unknown as Plugin,
    viteReact(),
  ],
});
