import path from "path";
import { defineConfig } from "vite";
import build from "@hono/vite-build/deno";

export default defineConfig({
  // define:{
  //   __wsRuntime__:"deno",
  // },
  plugins: [
    build({
      // Defaults are `src/index.ts`,`./src/index.tsx`,`./app/server.ts`
      entry: "src/entrypoint/index_deno.ts",
      minify: true,
      emptyOutDir: true,
      output: "index.js",
      external: ["hono", "hono/bun"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
