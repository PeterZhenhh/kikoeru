import type { SearchWorkParam, ObjEncoded } from "./api"

export type WorkMeta = {
    jFullNumber: string,
    age_category: number,
    workTitle: string,
    circleName: string,
    releaseDate: string,
    vas: string[],
    cover: URL["href"],
    dl_count: number,
    review_count: number,
    language_editions: {
        // jCode
        id: number,
        lang: string,
        title: string,
        source_id: string,
        is_original: boolean,
        source_type: "DLSITE"
    }[],
    tags: {
        id: ObjEncoded<SearchWorkParam>,
        name: string
    }[],
    rate_average_2dp: number,
    price: number
}

export type RemoteWork = {
    size: number
    page: number
    total: number
    jFullNumber: string[]
}