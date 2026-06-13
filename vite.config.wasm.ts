import path from "path";
import { defineConfig } from "vite";
import { getPlatformProxy } from "wrangler";
import build from "@hono/vite-build/cloudflare-pages";

export default defineConfig(async () => {
  return {
    plugins: [
      build({
        entry: "src/entrypoint/index_workerd.ts",
        emptyOutDir: true,
        minify: true,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 8080,
    },
  };
});
