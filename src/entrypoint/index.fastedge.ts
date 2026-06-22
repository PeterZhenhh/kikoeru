import { AppEnv } from "../types/hono.ts";
import app from "../main.ts";

async function eventHandler(event: FetchEvent): Promise<Response> {
    const env = {} as AppEnv["Bindings"];
    const resp = await app.fetch(event.request, env);
    return resp;
}

addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(eventHandler(event));
});
