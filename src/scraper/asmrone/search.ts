import type { RemoteSearchParams } from "@/types/api";
import type { RemoteWork } from "@/types/workMeta"

type SearchParms = {
    order: "release" | "create_date" | "rating" | "dl_count" | "price" | "rate_average_2dp" | "review_count" | "id" | "nsfw" | "random"
    sort: "asc" | "desc"
    page: number
    pageSize: 20
    subtitle: 0 | 1
    seed: number
    includeTranslationWorks: true
}

export default async (clientSP: RemoteSearchParams): Promise<RemoteWork> => {
    const sizeLimit = 20
    const data = await all(clientSP, sizeLimit)
    return { size: sizeLimit, page: clientSP.page, total: data.totalCount, jFullNumber: data.jFullNums }
}

const all = async (clientSP: RemoteSearchParams, sizeLimit: number): Promise<{ jFullNums: string[], totalCount: number }> => {
    const params: SearchParms = {
        order: "release",
        sort: clientSP.sort,
        page: clientSP.page,
        pageSize: 20,
        subtitle: clientSP.subtitle,
        seed: Math.floor(Math.random() * 100),
        includeTranslationWorks: true
    }
    switch (clientSP.order) {
        case "updated_at":
        case "created_at":
            params.order = "create_date"
            break
        case "userRating":
        case "post_views":
            params.order = "rating"
            break
        case "rating":
            params.order = "rate_average_2dp"
            break
        case "id":
        case "release":
        case "rate_average_2dp":
        case "dl_count":
        case "review_count":
        case "nsfw":
        case "price":
        case "random":
        default:
            params.order = clientSP.order
    }
    let url = new URL(`https://api.asmr.one/api/search/`)
    switch (clientSP.searchType) {
        case "circle":
            url.pathname += encodeURIComponent(`$circle:${clientSP.searchKeyword}$/`)
            break
        case "va":
            url.pathname += encodeURIComponent(`$va:${clientSP.searchKeyword}$/`)
            break
        case "tag":
            url.pathname += encodeURIComponent(`$tag:${clientSP.searchKeyword}$/`)
            break
        case "keyword":
            if (clientSP.searchKeyword) url.pathname += encodeURIComponent(`$tag:${clientSP.searchKeyword}$/`)
            else url = new URL("https://api.asmr.one/api/works")
            break
        default:
            break;
    }
    const searchParams = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))

    url.search = searchParams.toString()

    let data
    let ret = { totalCount: 0, jFullNums: [] }
    try {
        console.log(url.href);
        data = await (await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": `https://asmr.one`
            }
        })).json()
    } catch (error) {
        console.error(error);
        return ret
    }

    ret.totalCount = data?.pagination?.totalCount ?? 0
    ret.jFullNums = (data.works ?? []).map(
        (item: { source_id: string }) => item.source_id.toUpperCase()
    );
    return ret
}