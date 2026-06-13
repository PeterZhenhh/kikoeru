FROM oven/bun:latest

# 复制源码
COPY . .
RUN bun install --production

COPY --from=denoland/deno:bin /deno /usr/local/bin/deno

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "--unstable-sloppy-imports", "src/entrypoint/index_deno.ts"]