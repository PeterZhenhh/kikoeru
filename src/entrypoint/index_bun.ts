// Entrypoint for Bun
import { websocket, getConnInfo, serveStatic } from "hono/bun";
import app from "../main.ts";
import type { AppEnv } from "../types/hono.ts";
import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: Bun.env.SENTRY_DSN,
  sendDefaultPii: true,
  integrations: [
    Sentry.bunServerIntegration(),
    Sentry.contextLinesIntegration(),
    Sentry.extraErrorDataIntegration()
  ]
});

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
        serveStatic,
        getConnInfo,
        inbound: {},
        relay: {},
        specific: {
          bun: {},
        },
        debug: {},
        server: wsServer,
      } as unknown as AppEnv["Bindings"];
      const resp = await app.fetch(request, env)
      return resp;
    },
    idleTimeout: 60,
    websocket: websocket,
  })
  console.info(`[SYS] Web & WebSocket relay service started listening on ${hostname}:${port} (Bun)`);
  console.debug(process.memoryUsage());
  return server
}
)

export default servers[0]
