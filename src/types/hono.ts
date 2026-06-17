// ./types/hono.ts
import type { Context, Env, MiddlewareHandler } from "hono";
import type { ServeStaticOptions } from "hono/serve-static"
import type {
  Fetcher,
  Response as CFResponse,
} from "@cloudflare/workers-types/experimental";
import type { GetConnInfo } from "hono/conninfo";
import type { Runtime as HonoRuntime } from "hono/adapter";
import type { UpgradeWebSocket } from "hono/ws";
import type { Server } from "bun";
import type { Http2Bindings, HttpBindings } from "@hono/node-server";
import type { Context as ntlContext } from "@netlify/edge-functions";
// import {deno} from "Deno"

type NodeServerType = HttpBindings | Http2Bindings;
type UpgradeProtocol = "websocket" | undefined

export type AppBindings = {
  inbound: Inbound
  relay: Relay
  // 静态资源服务函数
  serveStaticByUrl: (
    url: URL,
    ctx: Context<AppEnv>
  ) => Promise<Response>;
  serveStatic: <E extends Env = Env>(options: ServeStaticOptions<E>) => MiddlewareHandler
  getConnInfo: GetConnInfo;
  // 运行时环境
  runtime: Runtime;
  specific: RuntimeSpecific;
  debug: Debug;
} & PlatformSpecific & RuntimeDeps & ConfiguredEnv

type RuntimeDeps = {
  // Runtime Specific
  // Deno
  remoteAddr?: Deno.NetAddr;
  // Cloudflare
  ASSETS: Fetcher;
  // Bun & Node.js & Netlify
  server: Server<any> | NodeServerType;
}

type Debug = {
  mem_inbound: number | undefined,
  mem_outbound: number | undefined
}


type Inbound = {
  // 入站url
  url: URL;
  // 自定义upstreamUrl (proxy url.searchParams)
  query: Record<string, string>;
  // 前端入站主域名
  frontMainDomain: string | undefined;
  // 前端入站子域名
  frontSubDomain: string | undefined;
  // 后端入站主域名
  backMainDomain: string | undefined;
  // 后端入站子域名
  backSubDomain: string | undefined;
  // 入站链接ID
  rayID: string;
  // 入站客户端IP
  ip: string | null | undefined;
  // 链接类型
  upgradeProtocol: UpgradeProtocol
};

type Relay = {
  serverRegion: string
  upstreamUrl: URL;
  rawReq: Request,
  rawReqHeaders: Record<string, string>,
  pxReq: Request,
  pxReqHeaders: Record<string, string>,
  remoteResp: Response
  remoteRespHeaders: Record<string, string>,
  pxResp: Response
  pxRespHeaders: Record<string, string>,
}

type RuntimeSpecific = {
  node: {
    upgradeWebSocket: UpgradeWebSocket;
  };
  deno: {};
  workerd: {};
  edgeone: {};
  bun: {};
  fastly: {};
  "edge-light": {};
  other: {};
  netlify: {
    context: ntlContext
  }
}

type PlatformSpecific = {
  // Platform Specific
  // Fly.io
  FLY_REGION?: string
  // Vercel
  VERCEL_REGION?: string
  // Deno Deploy
  DENO_REGION?: string
}

type ConfiguredEnv = {
  // 环境配置
  BACKEND_DOMAINS: string
  FRONTEND_DOMAINS: string
  ORIGIN_DOMAIN: string
  rprx_japaneseasmr: URL["origin"]
  rprx_dlsite: URL["origin"]

}

export interface AppEnv extends Env {
  Bindings: AppBindings;
}

export type Runtime = HonoRuntime | "edgeone" | "esa";
export type staticAssetRoot = "_private/" | "_public/"
