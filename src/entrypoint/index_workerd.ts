// Entrypoint for Cloudflare Pages
import type { AppEnv } from "../types/hono.ts";
import type {
    ExecutionContext,
    Response as CFResponse,
} from "@cloudflare/workers-types/experimental";
import app from "../main.ts";

console.info(
    "[SYS] Mimiko service started (Cloudflare Pages/Workers)",
);

export const entry = {
    async fetch(
        request: Request,
        env: AppEnv["Bindings"] & Env,
        ctx: ExecutionContext,
    ): Promise<Response> {
        const resp = await app.fetch(request, env);
        return resp;
    },
};

export default entry;
