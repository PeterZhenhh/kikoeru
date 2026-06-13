// Entrypoint for Tencent Cloud EdgeOne called from ./functions
import type { Context } from "hono"
import app from "../main.ts";
import type { AppEnv } from "../types/hono.ts";

const serveStaticByUrl = async (
  url: URL,
  c: Context<AppEnv>
): Promise<Response> => {
  const assetPath = `${url.pathname}`
  const eoHostname = c.req.raw.headers.get("eo-pages-host")
  const localUrl = new URL(assetPath, `${new URL(c.env.inbound.url).origin}`)
  localUrl.hostname = eoHostname || localUrl.hostname
  return fetch(localUrl, c.req.raw as RequestInit);
};

// EdgeOne Functions export
export default async (context: {
  uuid: string;
  request: Request;
  params: Record<string, string>;
  env: AppEnv["Bindings"];
  clientIp: string
  server: {
    region: string
    requestId: string
  },
  geo: Record<string, string>;
}): Promise<Response> => {
  const env = {
    ...context.env,
    serveStaticByUrl,
    inbound: { ip: context.clientIp },
    relay: { serverRegion: context.server?.region },
    runtime: "edgeone",
    specific: {
      edgeone: {},
    },
    debug: {},
  } as AppEnv["Bindings"];
  const resp = await app.fetch(context.request, env)
  return resp;
};
console.info("[SYS] Web & WebSocket relay service started (Tencent Cloud EdgeOne)");
