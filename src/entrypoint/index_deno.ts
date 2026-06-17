// Entrypoint for Deno Deploy
import { serveStatic, getConnInfo } from "hono/deno";
import app from "../main.ts";
import type { AppEnv } from "../types/hono.ts";

const PORT = parseInt(Deno.env.get("PORT") ?? "8080")
const PORT_COUNT = parseInt(Deno.env.get("PORT_COUNT") ?? "1")
const PORTS = Array.from({ length: PORT_COUNT }, (_, i) => PORT + i)

let servers = Array.from(PORTS, (port, i) => Deno.serve({
  hostname: "0.0.0.0",
  port,
  onListen({ port, hostname }) {
    console.info(
      `[SYS] uni-kikoeru service started listening on ${hostname}:${port} (Deno)`,
    );
    console.debug(Deno.memoryUsage())
  },
  handler: async (request: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) => {
    const env = {
      ...Deno.env.toObject(),
      serveStatic,
      getConnInfo,
      inbound: { ip: info.remoteAddr.hostname },
      relay: {},
      specific: {
        deno: {},
      },
      debug: {},
      remoteAddr: info.remoteAddr,
    } as AppEnv["Bindings"];
    const resp = await app.fetch(request, env)
    return resp;
  },
}))

export default servers[0]
