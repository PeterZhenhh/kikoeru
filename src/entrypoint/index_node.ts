// Entrypoint for Node.js
import { serve } from "@hono/node-server";
import type { Http2Bindings, HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { getConnInfo } from "@hono/node-server/conninfo";
import app from "../main.ts";
import type { AppEnv } from "../types/hono.ts";
// import { createNodeWebSocket } from '@hono/node-ws'
import { createNodeWebSocket } from "../utils/node-ws/src/index.ts";
import type { IncomingMessage } from "node:http";
import type { Http2ServerRequest } from "node:http2";

const getEnv = (request: IncomingMessage | Http2ServerRequest): AppEnv["Bindings"] => {
  return {
    ...process.env,
    serveStatic,
    getConnInfo,
    inbound: {},
    relay: {},
    specific: {
      node: {
        upgradeWebSocket,
      },
    },
    debug: {},
    server: { incoming: { socket: request.socket } },
  } as AppEnv["Bindings"];
};
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app,
  getEnv,
});

const PORT = parseInt(process.env.PORT ?? "8080")
const PORT_COUNT = parseInt(process.env.PORT_COUNT ?? "1")
const PORTS = Array.from({ length: PORT_COUNT }, (_, i) => PORT + i)

let servers = Array.from(PORTS, (port, i) => {
  const server = serve(
    {
      hostname: "0.0.0.0",
      port,
      fetch: async (request: Request, httpEnv: HttpBindings | Http2Bindings) => {
        const newEnv = getEnv(httpEnv.incoming);
        const resp = await app.fetch(request, newEnv);
        return resp;
      },
    },
    ({ address, family, port }) => {
      // failed to pass env for app.fetch
      // https://github.com/honojs/middleware/issues/1732
      injectWebSocket(server);
      console.info(`[INFO] Web & WebSocket relay service started listening on ${address}:${port} (Nodejs)`);
      console.debug(process.memoryUsage())
    },
  )
  return server
})
export default servers[0]
export { upgradeWebSocket };
