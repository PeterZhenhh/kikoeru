import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/entrypoint/index_eo.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [
        /^fastly:.*/,
        /^node:.*/,
        "jsonata",
        "hono/bun",
        "hono/deno",
        "subsrt-ts",
      ],
      output: {
        dir: "dist",
        entryFileNames: "index.js",
      },
    },
    target: "esnext",
    minify: false,
  },
  define: {
    __wsRuntime__: JSON.stringify("edgeone"),
  }
});
