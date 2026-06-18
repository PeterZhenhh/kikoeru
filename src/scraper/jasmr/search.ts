import type { RemoteSearchParams } from "@/types/api";
import type { RemoteWork } from "@/types/workMeta"

type SearchParms = {
    page: number,
    // 0-24
    limit: number,
    r18: boolean,
    r15: boolean,
    all: boolean,
    type: "video" | "earlyAccess",
    date: "week" | "month" | "year" | "alltime",
    // 0-6000
    min: number
    max: number
    tracks: boolean
    exclude: string
    sort: "viewsAscending" | "viewsDescending" | "dateAscending" | "dateDescending" | "likesAscending" | "likesDescending" | "relevanceAscending" | "relevanceDescending"
    search?: string
}

export default async (clientSP: RemoteSearchParams): Promise<RemoteWork> => {
    const sizeLimit = 20
    const data = await all(clientSP, sizeLimit)
    return { size: sizeLimit, page: clientSP.page, total: data.totalCount, jFullNumber: data.jFullNums }
}

const all = async (clientSP: RemoteSearchParams, sizeLimit: number): Promise<{ jFullNums: string[], totalCount: number }> => {
    const params: SearchParms = {
        page: clientSP.page,
        limit: sizeLimit,
        r18: true,
        r15: true,
        all: true,
        type: "video",
        date: "alltime",
        min: 0,
        max: 6000,
        tracks: false,
        exclude: "",
        sort: "dateDescending",
        search: clientSP.searchKeyword
    }
    switch (clientSP.sort) {
        case "asc":
            switch (clientSP.order) {
                case "id":
                case "created_at":
                case "release":
                    params.sort = "dateAscending"
                    break;
                case "rating":
                case "rate_average_2dp":
                    params.sort = "likesDescending"
                    break
                case "dl_count":
                case "review_count":
                    params.sort = "viewsAscending"
                    break
                case "nsfw":
                // params.r18 = false
                case "price":
                case "random":
                default:
                    break;
            }
            break;
        case "desc":
            switch (clientSP.order) {
                case "id":
                case "created_at":
                case "release":
                    params.sort = "dateDescending"
                    break;
                case "rating":
                case "rate_average_2dp":
                    params.sort = "likesAscending"
                    break
                case "dl_count":
                case "review_count":
                    params.sort = "viewsDescending"
                    break
                case "nsfw":
                    break
                case "price":
                case "random":
                default:
                    break;
            }
        default:
            break;
    }
    const url = new URL("https://www.jasmr.net/api/v1/search")

    const searchParams = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
        r18: String(params.r18),
        r15: String(params.r15),
        all: String(params.all),
        type: params.type,
        date: params.date,
        min: String(params.min),
        max: String(params.max),
        tracks: String(params.tracks),
        exclude: params.exclude,
        sort: params.sort,
        search: params.search ?? ""
    })

    url.search = searchParams.toString()

    let data
    let ret = { totalCount: 0, jFullNums: [] }
    try {
        console.log(url.href);
        data = await (await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": `https://www.jasmr.net`
            }
        })).json()
    } catch (error) {
        console.error(error);
        return ret
    }

    ret.totalCount = data.totalCount ?? 0
    ret.jFullNums = (data.results ?? []).map(
        (item: { rjCode: string }) => item.rjCode.toUpperCase()
    );
    return ret


}