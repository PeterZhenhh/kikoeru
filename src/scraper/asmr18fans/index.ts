import type { AppEnv } from "../../types/hono.ts";
import { tryGetContext } from "hono/context-storage";

export const getRemoteDomain = () => {
    return (
        tryGetContext<AppEnv>()?.env?.rprx_asmr18fans || "https://asmr18.fans"
    );
};

export { tracks } from "./tracks";
export { default as search } from "./search";
export { default as mediaStream } from "./mediaStream";
export { default as subtitle } from "./subtitle";
