// Entrypoint for Bun
import { websocket, getConnInfo } from "hono/bun";
import app from "../main.ts";
import type { AppEnv } from "../types/hono.ts";

const PORT = parseInt(process.env.PORT ?? "8080");
const PORT_COUNT = parseInt(process.env.PORT_COUNT ?? "1");
const PORTS = Array.from({ length: PORT_COUNT }, (_, i) => PORT + i);
let servers = Array.from(PORTS, (port, i) => {
    const hostname = "0.0.0.0";
    const server = Bun.serve({
        hostname,
        port,
        fetch: async (request: Request) => {
            const env = {
                ...Bun.env,
            } as unknown as AppEnv["Bindings"];
            const resp = await app.fetch(request, env);
            return resp;
        },
        websocket: websocket,
    });
    console.info(
        `[SYS] Mimiko service started listening on ${hostname}:${port} (Bun on Vercel)`,
    );
    return server;
});

export default servers[0];
