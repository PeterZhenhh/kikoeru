// Entrypoint for ESA
import type { Context } from "hono";
import type { AppEnv } from "../types/hono.ts";
import app from "../main.ts";
import process from "node:process";

console.info("[SYS] Mimiko service started (Alibaba Cloud ESA)");

export default {
    async fetch(request: Request): Promise<Response> {
        const env = {
            ...process.env,
            ...(typeof __envRuntime__ !== "undefined" && __envRuntime__),
        } as AppEnv["Bindings"];
        const resp = await app.fetch(request, env);
        return resp;
    },
};
