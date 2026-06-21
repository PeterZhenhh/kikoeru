// Entrypoint for Bun
import { websocket, getConnInfo } from "hono/bun";
import app from "../main.ts";
import { Hono } from "hono/tiny";
import type { Context } from "hono";
import type { AppEnv } from "../types/hono.ts";
import { proxy } from "hono/proxy";

const serveStaticByUrl = async (
  url: URL,
  c: Context<AppEnv>
): Promise<Response> => {
  const assetPath = `public${url.pathname}`.replace(/^public/, "")
  const staticApp: Hono = new Hono();
  staticApp.all("*", async (_c) => {
    const staticAssetUrl = new URL(
      assetPath,
      `https://${Bun.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    );
    let staticAssetResp: Response = new Response(null, { status: 404 });
    try {
      staticAssetResp = await proxy(staticAssetUrl);
    } catch (error) { }
    return staticAssetResp;
  });
  return staticApp.request(url);
};

const PORT = parseInt(process.env.PORT ?? "8080")
const PORT_COUNT = parseInt(process.env.PORT_COUNT ?? "1")
const PORTS = Array.from({ length: PORT_COUNT }, (_, i) => PORT + i)
let servers = Array.from(PORTS, (port, i) => {
  const hostname = "0.0.0.0"
  const server = Bun.serve({
    hostname,
    port,
    fetch: async (request, wsServer) => {
      const env = {
        ...Bun.env,
        serveStaticByUrl,
        getConnInfo,
        inbound: {},
        relay: {},
        specific: {
          bun: {},
        },
        debug: {},
        server,
      } as unknown as AppEnv["Bindings"];
      const resp = await app.fetch(request, env);
      return resp;
    },
    websocket: websocket,
  });
  console.info(`[SYS] uni-kikoeru service started listening on ${hostname}:${port} (Bun on Vercel)`);
  return server
})


export default servers[0]
