import app from "../main.ts";
import type { AppEnv } from "../types/hono.ts";
import type { Context as ntlContext } from "@netlify/edge-functions";

console.info(
    "[SYS] Mimiko service started (Netlify@Edge Functions)",
);

export default async (request: Request, context: ntlContext) => {
    const env = {
        ...Deno.env.toObject(),
    } as AppEnv["Bindings"];
    const resp = await app.fetch(request, env);
    return resp;
};
