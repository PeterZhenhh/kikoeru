import type { RemoteSearchParams } from "@/types/api";
import type { RemoteWork, WorkFullNumber } from "@/types/workMeta";
import type { AppEnv } from "../../types/hono.ts";
import { tryGetContext } from "hono/context-storage";
import * as cheerio from "cheerio";

type SearchParms = {
    // /page/1
    // page: number,
    // orderby: "date" | "title" | "post_views" | "comment_count",
    // order: "asc" | "desc",
    s?: string;
    // size?:14
};

const getRemoteDomain = () => {
    return (
        tryGetContext<AppEnv>()?.env?.rprx_asmr18fans || "https://asmr18.fans"
    );
};

export default async (clientSP: RemoteSearchParams): Promise<RemoteWork> => {
    const data = await all(clientSP);
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
    const kw = String(clientSP.searchKeyword);
    kw.replace("'", "").replace(" ", "-");
    return new URL(`${getRemoteDomain()}/cv/${kw}/`);
};

const urlByCircle = (clientSP: RemoteSearchParams): URL | null => {
    if (clientSP.searchType != "circle") return null;
    if (!clientSP.searchKeyword) return null;
    const kw = String(clientSP.searchKeyword);
    kw.replace(" ", "-");
    return new URL(`${getRemoteDomain()}/circle/${kw}/`);
};

const urlByTag = (clientSP: RemoteSearchParams): URL | null => {
    if (clientSP.searchType != "tag") return null;
    if (!clientSP.searchKeyword) return null;
    const kw = String(clientSP.searchKeyword);
    kw.replace("'", "").replace("/", "-");
    return new URL(`${getRemoteDomain()}/genre/${kw}/`);
};

const urlByKeyword = (clientSP: RemoteSearchParams): URL => {
    if (clientSP.searchKeyword)
        return new URL(`${getRemoteDomain()}/?s=${clientSP.searchKeyword}`);
    else return new URL(`${getRemoteDomain()}/`);
};

const all = async (
    clientSP: RemoteSearchParams,
): Promise<{ jFullNums: WorkFullNumber[]; totalCount: number }> => {
    const baseUrl =
        urlByCv(clientSP) ??
        urlByCircle(clientSP) ??
        urlByTag(clientSP) ??
        urlByKeyword(clientSP);
    const url = new URL(baseUrl);
    const params: SearchParms = {};
    url.pathname += `page/${clientSP.page}/`;
    if (!clientSP.searchKeyword) {
        switch (clientSP.order) {
            case "id":
            case "updated_at":
            case "created_at":
            case "release":
            case "post_views":
            case "rating":
            case "userRating":
            case "rate_average_2dp":
            case "dl_count":
            case "review_count":
            case "nsfw":
            case "price":
            case "random":
            default:
                url.pathname = `/boys${url.pathname}`;
        }
    }

    url.search = new URLSearchParams({
        ...Object.fromEntries(baseUrl.searchParams.entries()),
        ...params,
    }).toString();

    let html;
    let ret: { totalCount: number; jFullNums: WorkFullNumber[] } = {
        totalCount: 0,
        jFullNums: [],
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
            console.log(`Asmr18fans is blocked`);
            return ret;
        }
        html = await resp.text();
    } catch (error) {
        console.error(error);
        return ret;
    }

    const $ = cheerio.load(html);
    const rjCodes = $(".post-list a[href]")
        .map((_, el) => {
            const text = $(el).attr("href")!;
            const matches = text.match(/[RBV]J\d+/i)?.[0] as WorkFullNumber;
            return matches ?? null;
        })
        .get()
        .filter(Boolean);

    ret.jFullNums = rjCodes;
    ret.totalCount = rjCodes.length;
    return ret;
};
