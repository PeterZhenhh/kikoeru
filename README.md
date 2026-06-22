# Mimiko

A lightweight, Kikoeru-compatible backend that aggregates ASMR content from multiple sources and exposes a unified API.

Mimiko bridges metadata, tracks, subtitles, and streaming resources from various ASMR platforms while maintaining compatibility with existing Kikoeru clients.

## Features

* 🎧 Kikoeru-compatible API
* 🔍 Unified search across multiple ASMR sources
* 📚 Automatic DLsite metadata enrichment
* 📝 Subtitle retrieval and LRC generation
* 📱 Automatic subtitle-to-LRC conversion for mobile app compatibility
* 🎵 Audio streaming proxy
* 📂 Hierarchical track tree support
* 🔐 Compatible authentication endpoints for Kikoeru clients
* ⚡ Edge-runtime friendly
* 🌍 Deployable across multiple runtimes

## Supported Sources

* ASMR ONE
* Japanese ASMR
* JASMR
* Hentai ASMR
* ASMR18 Fans

## Supported Runtimes

### Tested and Working

✅ Cloudflare Workers

✅ Cloudflare Pages Functions

✅ Deno

✅ Vercel

### Planned / Untested

🚧 Node.js

🚧 Bun

🚧 Netlify

🚧 Fastly Compute

🚧 EdgeOne Pages

🚧 Wasmer Edge

## Quick Start

### Install

```bash
npm install
```

### Development

Cloudflare Workers:

```bash
npm run dev-workers
```

Cloudflare Pages:

```bash
npm run dev-pages
```

Bun:

```bash
npm run dev-bun
```

Deno:

```bash
npm run dev-deno
```

Default endpoint:

```text
http://localhost:8080
```

## Environment Variables

The following environment variables are supported:

### Server Configuration

| Variable     | Description                       | Default |
| ------------ | --------------------------------- | ------- |
| `PORT`       | Starting HTTP server port         | `8080`  |
| `PORT_COUNT` | Number of ports to bind/listen on | `1`     |

### Upstream Proxy Configuration

These variables define the upstream proxy endpoints used when accessing external resources.

| Variable              | Description                                    |
| --------------------- | ---------------------------------------------- |
| `rprx_japaneseasmr`   | Proxy origin for Japanese ASMR                 |
| `rprx_v_japaneseasmr` | Proxy origin for Japanese ASMR media resources |
| `rprx_dlsite`         | Proxy origin for DLsite requests               |
| `rprx_m3u8Cnv`        | M3U8 conversion/proxy endpoint (full URL)      |
| `rprx_hentaiasmr`     | Proxy origin for Hentai ASMR                   |
| `rprx_asmr18fans`     | Proxy origin for ASMR18 Fans                   |
| `rprx_jasmr`          | Proxy origin for JASMR                         |
| `rprx_general`        | General-purpose upstream proxy origin          |

### Example

```env
PORT=8080
PORT_COUNT=1

rprx_japaneseasmr=https://japaneseasmr.com
rprx_v_japaneseasmr=https://v.weeab0o.xyz
rprx_dlsite=https://www.dlsite.com
rprx_m3u8Cnv=https://example.com/m3u8tomp3?url=
rprx_hentaiasmr=https://hentaiasmr.moe
rprx_asmr18fans=https://asmr18.fans
rprx_jasmr=https://www.jasmr.net
rprx_general=https://your-proxy.com?proxyurlbase64=
```

> **Note**
>
> Due to DLsite's regional restrictions, some work metadata may only be accessible from Japanese IP addresses. For the best metadata coverage and compatibility, it is recommended to deploy Mimiko on infrastructure located in Japan or configure `rprx_dlsite` to use a Japanese outbound proxy.

## API Endpoints

### Health Check

```http
GET /api/health
```

Returns a simple status response indicating that the service is running.

### Authentication

```http
POST /auth/me
```

Kikoeru-compatible authentication endpoint. Returns information about the current user session and can be used by compatible clients during initialization and login checks.

### Get Work Information

```http
GET /api/work/{WorkCode}
```

Returns aggregated metadata for a work, including information collected from supported sources and DLsite enrichment data when available.

### Get Tracks

```http
GET /api/tracks/{WorkCode}
```

Returns the hierarchical track tree and media information for a work.

### Search Works

```http
GET /api/search/{keyword}
```

Search works across all supported sources using a keyword.

### Browse Works

```http
GET /api/works
```

Browse and discover works with sorting and filtering options.

### Browse by Voice Actor, Tag or Circle

```http
GET /api/vas/{ObjEncoded<SearchWorkIdObj>}/works
```

Browse works associated with a specific voice actor, tag or circle.

### Check Subtitle/Chapter Availability

```http
GET /media/check-lrc/{ObjEncoded<TrackFileHash>}
```

Checks whether subtitle data is available for the specified media file. Returns subtitle metadata and availability status when supported by the source.

### Export Subtitle as LRC/Raw File

```http
GET /media/stream/{ObjEncoded<TrackFileHash | SubtitleQueryHash>}
```

Streams media resources and, when subtitle data is available, automatically converts subtitles into standard LRC format. This feature is designed to improve compatibility with mobile music and ASMR applications that support synchronized lyrics but do not support source subtitle formats directly.

## Why Mimiko?

Most ASMR platforms provide only partial metadata, limited search capabilities, or incompatible APIs.

Mimiko aggregates multiple sources into a single interface, enriches metadata with information from DLsite, and provides a consistent API for applications such as Kikoeru, custom web clients, mobile apps, and personal archives.

## Disclaimer

This project does not host or redistribute copyrighted audio content.

All copyrights belong to their respective creators, publishers, and platforms. Mimiko only aggregates publicly available metadata and proxies resources on user request.

Please support creators by purchasing works from official stores whenever possible.

## License

MIT
