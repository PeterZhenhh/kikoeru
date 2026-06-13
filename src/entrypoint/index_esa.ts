// Entrypoint for ESA
import type { Context } from "hono"
import type { AppEnv } from "../types/hono.ts";
import app from "../main.ts";
import process from 'node:process'

console.info("[SYS] Web & WebSocket relay service started (Alibaba Cloud ESA)");

const serveStaticByUrl = async (
  url: URL,
  c: Context<AppEnv>
): Promise<Response> => {
  const assetPath = `${url.pathname}`
  /*   // TODO: Implement after Alibaba Cloud ESA is available (target: July)
    const localUrl = new URL(assetPath, `${c.env.inbound.url.origin}`) */
  const localUrl = new URL(assetPath, `${c.env.inbound.url.protocol}//static.${c.env.inbound.frontMainDomain}`)
  return await fetch(localUrl)
};

export default {
  async fetch(
    request: Request,
  ): Promise<Response> {
    const env = {
      ...process.env,
      ...((typeof __envRuntime__ !== "undefined" && __envRuntime__)),
      serveStaticByUrl,
      inbound: {},
      relay: {},
      specific: {},
      debug: {},
      runtime: "esa"
    } as AppEnv["Bindings"];
    const resp = await app.fetch(request, env)
    return resp;
  },
};