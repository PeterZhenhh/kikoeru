import type { RemoteSearchParams } from "@/types/api";
import type { RemoteWork, WorkFullNumber } from "@/types/workMeta";
import * as cheerio from "cheerio";
import cvMap from "./cvMap.json" with { type: "json" };
import circleMap from "./circleMap.json" with { type: "json" };
import { getRemoteDomain } from "./";

type SearchParms = {
    // /page/1
    // page: number,
    orderby: "date" | "title" | "post_views" | "comment_count";
    order: "asc" | "desc";
    s?: string;
    // size?:14
};

export default async (clientSP: RemoteSearchParams): Promise<RemoteWork> => {
    const data = await searchAllInPage(clientSP);
    return {
        size: 14,
        page: clientSP.page,
        total: data.totalCount,
        jFullNumber: data.jFullNums,
    };
};

const urlByCv = (clientSP: RemoteSearchParams): URL | null => {
    if (clientSP.searchType != "va") return null;
    if (!clientSP.searchKeyword) return null;

    const map = cvMap as Record<string, string>;
    const v = map[clientSP.searchKeyword];
    if (!v) {
        return null;
    }
    return new URL(`${getRemoteDomain()}/tag/${v}/`);
};

const urlByCircle = (clientSP: RemoteSearchParams): URL | null => {
    if (clientSP.searchType != "circle") return null;
    if (!clientSP.searchKeyword) return null;
    const map = circleMap as Record<string, string>;
    const v = map[clientSP.searchKeyword];
    if (!v) {
        return null;
    }
    return new URL(`${getRemoteDomain()}/category/${v}/`);
};

const urlByKeyword = (clientSP: RemoteSearchParams): URL => {
    return new URL(`${getRemoteDomain()}/?s=${clientSP.searchKeyword}`);
};

export const searchAllInPage = async (
    clientSP: RemoteSearchParams,
): Promise<{
    jFullNums: WorkFullNumber[];
    totalCount: number;
    pageIds: Record<WorkFullNumber, number>;
}> => {
    const baseUrl =
        urlByCv(clientSP) ?? urlByCircle(clientSP) ?? urlByKeyword(clientSP);
    const url = new URL(baseUrl);
    const params: SearchParms = {
        orderby: "date",
        order: "desc",
    };
    url.pathname += `page/${clientSP.page}/`;
    switch (clientSP.sort) {
        case "asc":
            params.order = "asc";
            break;
        case "desc":
            params.order = "desc";
        default:
            break;
    }
    switch (clientSP.order) {
        case "id":
        case "created_at":
        case "release":
        case "updated_at":
            params.orderby = "date";
            break;
        case "post_views":
        case "rating":
        case "userRating":
        case "rate_average_2dp":
            params.orderby = "post_views";
            break;
        case "dl_count":
        case "review_count":
            params.orderby = "comment_count";
        case "nsfw":
        case "price":
        case "random":
        default:
            break;
    }
    url.search = new URLSearchParams({
        ...Object.fromEntries(baseUrl.searchParams.entries()),
        ...params,
    }).toString();

    let html;
    let ret: {
        totalCount: number;
        jFullNums: WorkFullNumber[];
        pageIds: Record<WorkFullNumber, number>;
    } = {
        totalCount: 0,
        jFullNums: [],
        pageIds: {},
    };
    try {
        console.log(url.href);
        const resp = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                referer: `${getRemoteDomain()}`,
            },
        });
        if (resp.status !== 200) {
            console.log(`Japaneseasmr is blocked`);
            return ret;
        }
        html = await resp.text();
    } catch (error) {
        console.error(error);
        return ret;
    }

    const $ = cheerio.load(html);

    const datas = $("li.site-archive-post")
        .map((_, el) => {
            const text = $(el).text();

            const jFullNum = text.match(/[RBV]J\d+/i)?.[0] as WorkFullNumber;
            if (!jFullNum) return null;

            const href = $(el).find("h2.entry-title a").attr("href");

            const pageId = href?.match(/\/(\d+)\/?$/)?.[1];
            if (!pageId) return null;

            return {
                jFullNum,
                pageId: Number(pageId),
            };
        })
        .get()
        .filter(Boolean);

    ret.jFullNums = datas.map((v) => v.jFullNum);

    ret.pageIds = Object.fromEntries(datas.map((v) => [v.jFullNum, v.pageId]));

    ret.totalCount = ret.jFullNums.length;
    return ret;
};
