import app from "../main.ts";
import type { AppEnv } from "../types/hono.ts";
import type { Context as ntlContext } from "@netlify/edge-functions";
import { getConnInfo } from 'hono/netlify'
import type { Context } from "hono";

console.info("[SYS] Web & WebSocket relay service started (Netlify@Edge Functions)");

const serveStaticByUrl = async (
  url: URL,
  c: Context<AppEnv>
): Promise<Response> => {
  const assetPath = `public${url.pathname}`.replace(/^public/, "")
  const staticAssetUrl = new URL(
    assetPath,
    c.env.inbound.url.origin,
  );
  // 需转为小写路径，否则301
  return c.env.specific.netlify.context.next(new Request(staticAssetUrl.href.toLowerCase()), { sendConditionalRequest: true })
};





export default async (request: Request, context: ntlContext) => {
  const env = {
    ...Deno.env.toObject(),
    serveStaticByUrl,
    getConnInfo,
    inbound: {},
    relay: {},
    specific: {
      netlify: {
        context: context
      }
    },
    debug: {},
  } as AppEnv["Bindings"];
  const resp = await app.fetch(request, env)
  return resp
};