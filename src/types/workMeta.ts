import type { SearchWorkIdObj, ObjEncoded } from "./api"
import codeMapping from "./codeMapping"

export type WorkMeta = {
    jFullNumber: WorkFullNumber,
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
        id: ObjEncoded<SearchWorkIdObj>,
        name: string
    }[],
    rate_average_2dp: number,
    price: number
}

export type RemoteWork = {
    size: number
    page: number
    total: number
    jFullNumber: WorkFullNumber[]
}

// "RJ" | "BJ" | "VJ"
type WorkNumPrefix = keyof typeof codeMapping.work

// -1 | -2 | -3
type WorkCodePrefix =
    (typeof codeMapping.work)[WorkNumPrefix]

/**
 * 作品号转义数字类型
 * 语义：采用RJ/BJ/VJ类型映射前缀(-1/-2/-3) + 数值 拼接而成的数字标识
 */
export type WorkCode = number & {
    readonly __workcode__: `${WorkCodePrefix}${number}`;
};

export type WorkFullNumber = `${WorkNumPrefix}${number}`