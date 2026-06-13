import path from "path";
import { defineConfig } from "vite";
import build from "@hono/vite-build/bun";

export default defineConfig({
  plugins: [
    build({
      // Defaults are `src/index.ts`,`./src/index.tsx`,`./app/server.ts`
      entry: "src/entrypoint/index_vercel_bun.ts",
      minify: true,
      emptyOutDir: true,
      output: "index.js",
      external: ["hono"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
