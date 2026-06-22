/// <reference types="@fastly/js-compute" />
import rc from "../../static-publish.rc.js";
import app from "../main.ts";
import { AppEnv } from "../types/hono.ts";
import { env } from "fastly:env";

// import {
//   contextStorage,
//   getContext,
//   tryGetContext,
// } from 'hono/context-storage'

console.info(
    `[SYS] Mimiko service started listening on ${env("FASTLY_HOSTNAME")}:${env("PORT")} (Fastly)`,
);

addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(handleRequest(event));
});

const handleRequest = async (event: FetchEvent): Promise<Response> => {
    const env = {
        // ...env,
    } as AppEnv["Bindings"];
    const resp = await app.fetch(event.request, env);
    return resp;
    // return new Response(`Failed to run on fastly because\n{"pop":"CHI","level":"error","diagnostic":"instance_limit","limit":"cpu_timeout"} OR\nBackend constructor: Unable to create a dynamic backend for 'xxx.com' - dynamic backends are unsupported on this service. Either explicitly configure backend services or contact Fastly support to enable dynamic backends.`, { status: 500 });
};
