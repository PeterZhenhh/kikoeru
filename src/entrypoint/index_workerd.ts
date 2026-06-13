// Entrypoint for Cloudflare Pages
import type { AppEnv } from "../types/hono.ts";
import type {
  Fetcher,
  ExecutionContext,
  Response as CFResponse,
} from "@cloudflare/workers-types/experimental";
import app from "../main.ts";
import { getConnInfo } from "hono/cloudflare-workers";
import type { Context } from "hono";

interface Env {
  ASSETS: Fetcher;
}
console.info("[SYS] Web & WebSocket relay service started (Cloudflare Pages/Workers)");
const serveStaticByUrl = async (
  url: URL,
  ctx: Context<AppEnv>
): Promise<Response | CFResponse> => {
  const assetPath = `public${url.pathname}`
  const localUrl = new URL(
    `http://localhost/${assetPath}`
  );
  return ctx.env.ASSETS.fetch(localUrl);
};
export const entry = {
  async fetch(
    request: Request,
    env: AppEnv["Bindings"] & Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    env = {
      ...env,
      serveStaticByUrl,
      getConnInfo,
      inbound: {},
      relay: {},
      specific: {
        workerd: {},
      },
      debug: {},
      ASSETS: env.ASSETS
    } as AppEnv["Bindings"];
    const resp = await app.fetch(request, env);
    return resp;
  },
};

export default entry;
