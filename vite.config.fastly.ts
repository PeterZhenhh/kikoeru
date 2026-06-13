import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/entrypoint/index_fastly.ts"),
      formats: ["es"], // 对应 --platform=neutral（更接近纯 ESM 输出）
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [
        /^fastly:.*/,   // --external:fastly:*
        /^node:.*/,     // --external:node:*
        "jsonata",
        "hono/bun",
        "hono/deno",
        "subsrt-ts",
      ],
      output: {
        dir: "dist",
      },
    },
    target: "esnext",
    minify: false, // esbuild 默认不一定压，这里按需
  },
  define: {
    __wsRuntime__: JSON.stringify("fastly"), // 等价 --define
    __envRuntime__: JSON.stringify(process.env), // 等价 --define
  },
});