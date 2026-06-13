import type { Context } from 'hono'
import type { AppEnv } from './hono.ts'
import { Runtime } from 'hono/adapter'

declare global {
    const $ctx: Context<AppEnv>
    const $logger: Console

    // Builder
    const __wsRuntime__: Runtime | undefined
    const __envRuntime__: Record<string, unknown> | undefined
}