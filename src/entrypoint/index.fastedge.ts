import type { Context } from "hono";
import { AppEnv } from "../types/hono.ts";
import app from "../main.ts";
import { createStaticServer } from '@gcoredev/fastedge-sdk-js';
const stylesStaticServer = async () => {
    const publicStaticAssets = (await import("../public-static-assets.ts")).staticAssetManifest
    return createStaticServer(publicStaticAssets, {
        routePrefix: 'public',
    })
}

const serveStaticByUrl = async (
    url: URL,
    ctx: Context<AppEnv>
): Promise<Response> => {
    const assetPath = `public${url.pathname}`
    const localUrl = new URL(
        `http://localhost/${assetPath}`
    );
    return (await stylesStaticServer()).serveRequest(new Request(localUrl.href, ctx.req.raw as RequestInit)) as Promise<Response> ?? new Response(null, { status: 404 })
};



async function eventHandler(event: FetchEvent): Promise<Response> {
    const env = {
        serveStaticByUrl,
        inbound: {},
        relay: {},
        specific: {
        },
        debug: {},
    } as AppEnv["Bindings"];
    const resp = await app.fetch(event.request, env);
    return resp;
}

addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(eventHandler(event));
});



