import type { RemoteSearchParams } from "@/types/api";
import type { RemoteWork } from "@/types/workMeta"
import type { AppEnv } from "../../types/hono.ts";
import { tryGetContext } from 'hono/context-storage'
import * as cheerio from "cheerio";
import cvMap from "./cvMap.json" with { type: "json" };
import circleMap from "./circleMap.json" with { type: "json" };

type SearchParms = {
    // /page/1
    // page: number,
    orderby: "date" | "title" | "post_views" | "comment_count",
    order: "asc" | "desc",
    s?: string
    // size?:14
}

const getRemoteDomain = () => {
    return tryGetContext<AppEnv>()?.env?.rprx_japaneseasmr || "https://japaneseasmr.com"
}


export default async (clientSP: RemoteSearchParams): Promise<RemoteWork> => {
    const data = await all(clientSP)
    return { size: 14, page: clientSP.page, total: data.totalCount, jFullNumber: data.jFullNums }
}

const urlByCv = (clientSP: RemoteSearchParams): URL | null => {
    if (clientSP.searchType != "va") return null
    if (!clientSP.searchKeyword) return null

    const map = cvMap as Record<string, string>;
    const v = map[clientSP.searchKeyword]
    if (!v) {
        return null;
    }
    return new URL(`${getRemoteDomain()}/tag/${v}/`)
}

const urlByCircle = (clientSP: RemoteSearchParams): URL | null => {
    if (clientSP.searchType != "circle") return null
    if (!clientSP.searchKeyword) return null
    const map = circleMap as Record<string, string>;
    const v = map[clientSP.searchKeyword]
    if (!v) {
        return null;
    }
    return new URL(`${getRemoteDomain()}/category/${v}/`)
}

const urlByKeyword = (clientSP: RemoteSearchParams): URL => {
    return new URL(`${getRemoteDomain()}/?s=${clientSP.searchKeyword}`)
}

const all = async (clientSP: RemoteSearchParams): Promise<{ jFullNums: string[], totalCount: number }> => {
    const baseUrl = urlByCv(clientSP) ?? urlByCircle(clientSP) ?? urlByKeyword(clientSP)
    const url = new URL(baseUrl)
    const params: SearchParms = {
        orderby: "date",
        order: "desc"
    }
    url.pathname += `page/${clientSP.page}/`
    switch (clientSP.sort) {
        case "asc":
            params.order = "asc"
            break
        case "desc":
            params.order = "desc"
        default:
            break
    }
    switch (clientSP.order) {
        case "id":
        case "created_at":
        case "release":
            params.orderby = "date"
            break;
        case "rating":
        case "rate_average_2dp":
            params.orderby = "post_views"
            break
        case "dl_count":
        case "review_count":
            params.orderby = "comment_count"
        case "nsfw":
        case "price":
        case "random":
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
        html = await (await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": `${getRemoteDomain()}`
            }
        })).text()
        console.log(html);
        
    } catch (error) {
        console.error(error);
        return ret
    }

    const $ = cheerio.load(html);
    const rjCodes = $("li.site-archive-post")
        .map((_, el) => {
            const text = $(el).text();
            const matches = text.match(/[RBV]J\d+/gi);
            return matches?.[0] ?? null;
        })
        .get()
        .filter(Boolean);
    // 有下一页
    const hasNext = $(".nav-links .next.page-numbers").length > 0;
    // 当前页
    const currentPage = Number(
        $(".page-numbers.current").text().trim()
    );

    // 所有页码
    const pages: number[] = [];

    $(".page-numbers").each((_, el) => {
        const text = $(el).text().trim();
        const num = Number(text);
        if (!Number.isNaN(num)) {
            pages.push(num);
        }
    });

    const lastPage = Math.max(...pages);
    ret.jFullNums = rjCodes
    ret.totalCount = hasNext ? 14 * lastPage : 14 * (Math.max(currentPage, 1) - 1) + rjCodes.length
    return ret
}