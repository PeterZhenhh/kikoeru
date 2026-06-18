import type { RemoteSearchParams } from "@/types/api";
import type { RemoteWork } from "@/types/workMeta"
import type { AppEnv } from "../../types/hono.ts";
import { tryGetContext } from 'hono/context-storage'
import * as cheerio from "cheerio";

type SearchParms = {
    // /page/1
    // page: number,
    filter: "latest" | "popular" | "most-viewed" | "longest" | "random",
    s?: string
    // size?:21
}

const getRemoteDomain = () => {
    return tryGetContext<AppEnv>()?.env?.rprx_hentaiasmr || "https://hentaiasmr.moe"
}


export default async (clientSP: RemoteSearchParams): Promise<RemoteWork> => {
    const data = await all(clientSP)
    return { size: 21, page: clientSP.page, total: data.totalCount, jFullNumber: data.jFullNums }
}

const urlByCv = (clientSP: RemoteSearchParams): URL | null => {
    if (clientSP.searchType != "va") return null
    if (!clientSP.searchKeyword) return null
    return new URL(`${getRemoteDomain()}/actor/${clientSP.searchKeyword}/`)
}

const urlByKeyword = (clientSP: RemoteSearchParams): URL => {
    return new URL(`${getRemoteDomain()}/?s=${clientSP.searchKeyword}`)
}

const all = async (clientSP: RemoteSearchParams): Promise<{ jFullNums: string[], totalCount: number }> => {
    const baseUrl = urlByCv(clientSP) ?? urlByKeyword(clientSP)
    const url = new URL(baseUrl)
    const params: SearchParms = {
        filter: "latest"
    }
    url.pathname += `page/${clientSP.page}/`
    switch (clientSP.order) {
        case "id":
        case "created_at":
        case "release":
            params.filter = "latest"
            break;
        case "rating":
        case "rate_average_2dp":
            params.filter = "popular"
            break
        case "dl_count":
        case "review_count":
            params.filter = "most-viewed"
        case "nsfw":
        case "price":
            break
        case "random":
            params.filter = "random"
            break
        default:
            break;
    }
    url.search = new URLSearchParams(
        {
            ...Object.fromEntries(baseUrl.searchParams.entries()),
            ...params,
        }
    )
        .toString()

    let html
    let ret: { totalCount: number, jFullNums: string[] } = { totalCount: 0, jFullNums: [] }
    try {
        console.log(url.href);
        const resp = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": `${getRemoteDomain()}`
            }
        })
        if (resp.status !== 200) {
            console.log(`hentaiasmr is blocked`);
            return ret
        }
        html = await (resp).text()

    } catch (error) {
        console.error(error);
        return ret
    }

    const $ = cheerio.load(html);
    const hasNothingFound =
        $('h1.widget-title').filter((_, el) =>
            $(el).text().trim() === 'Nothing found'
        ).length > 0;
    if (hasNothingFound) return ret

    const rjCodes = $(".rjcodes")
        .map((_, el) => {
            const text = $(el).text();
            const matches = text.match(/[RBV]J\d+/gi);
            return matches?.[0] ?? null;
        })
        .get()
        .filter(Boolean);
    ret.jFullNums = rjCodes
    ret.totalCount = rjCodes.length
    return ret
}