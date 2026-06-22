// ./types/hono.ts
import type { Env } from "hono";

export type AppBindings = ConfiguredEnv;

type ConfiguredEnv = {
    // 环境配置
    rprx_japaneseasmr: URL["origin"];
    rprx_v_japaneseasmr: URL["origin"];
    rprx_dlsite: URL["origin"];
    rprx_m3u8Cnv: URL["href"];
    rprx_hentaiasmr: URL["origin"];
    rprx_asmr18fans: URL["origin"];
    rprx_jasmr: URL["origin"];
    rprx_general: URL["origin"];
};

export interface AppEnv extends Env {
    Bindings: AppBindings;
}
