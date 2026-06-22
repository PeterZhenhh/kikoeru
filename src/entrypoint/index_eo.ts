// Entrypoint for Tencent Cloud EdgeOne called from ./functions
import type { Context } from "hono";
import app from "../main.ts";
import type { AppEnv } from "../types/hono.ts";

// EdgeOne Functions export
export default async (context: {
    uuid: string;
    request: Request;
    params: Record<string, string>;
    env: AppEnv["Bindings"];
    clientIp: string;
    server: {
        region: string;
        requestId: string;
    };
    geo: Record<string, string>;
}): Promise<Response> => {
    const env = {
        ...context.env,
    } as AppEnv["Bindings"];
    const resp = await app.fetch(context.request, env);
    return resp;
};
console.info(
    "[SYS] Mimiko service started (Tencent Cloud EdgeOne)",
);
