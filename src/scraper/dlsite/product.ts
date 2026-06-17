import type { WorkMeta } from "@/types/workMeta"
import type { WorkInfo } from "@/types/api";
import type { AppEnv } from "../../types/hono.ts";
import { tryGetContext } from 'hono/context-storage'
import * as jNumCoder from "../../utils/jNumCoder"
import * as objCoder from "../../utils/objCoder"

type VoiceBy = {
    id: string;
    name: string;
    classification: string;
    sub_classification: string | null;
};

type genres = { name: string, id: number, search_val: string, name_base: string }

const getRemoteDomain = () => {
    return tryGetContext<AppEnv>()?.env?.rprx_dlsite || "https://www.dlsite.com"
}

export const fetchWorkMeta = async (jFullNumber: string): Promise<WorkMeta> => {
    return (await fetchWorkMeta1(jFullNumber)) ?? (await fetchWorkMeta2(jFullNumber)) ?? ({ jFullNumber }) as WorkMeta
}

export const fetchWorkMeta1 = async (jFullNumber: string): Promise<WorkMeta | null> => {
    let rawData: Record<string, any> = ({ jFullNumber })
    let retData = ({ jFullNumber }) as WorkMeta
    try {
        const url = `getRemoteDomain()/maniax/api/=/product.json?workno=${jFullNumber.toUpperCase()}`
        rawData = (await (await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "accept-language": "zh-CN,zh;q=0.9",
                "cookie": "locale=zh-cn"
            }
        })).json())[0]
        if (!rawData) {
            return null
        }
    } catch (error) {
        console.error(error)
        return null
    }

    retData = {
        jFullNumber: rawData.workno,
        workTitle: rawData.product_name,
        circleName: rawData.maker_name,
        releaseDate: new Date(rawData.regist_date).toISOString().slice(0, 10),
        vas: ((rawData.creaters?.voice_by) ?? []).map((item: VoiceBy) => item.name),
        cover: `https://img.dlsite.jp/${rawData.image_main.relative_url}`,
        language_editions: (rawData.language_editions ?? []).map((item: Record<string, any>) => ({
            id: jNumCoder.toCode(item.workno),
            lang: item.label,
            title: `${item.label} ${item.workno}`,
            source_id: item.workno,
            is_original: false,
            source_type: "DLSITE"
        }) as WorkMeta["language_editions"][number]),
        tags: (rawData.genres ?? []).map((genre: genres) => ({
            id: objCoder.encode({ t: "tag", v: genre.name_base }), name: genre.name || genre.name_base
        }) as WorkMeta["tags"][number])
    }
    return retData
}

export const fetchWorkMeta2 = async (jFullNumber: string): Promise<WorkMeta | null> => {
    let rawData: Record<string, any> = ({ jFullNumber })
    let retData = ({ jFullNumber }) as WorkMeta
    try {
        const url = `getRemoteDomain()/maniax/product/info/ajax?product_id=${jFullNumber.toUpperCase()}`
        rawData = (await (await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "accept-language": "zh-CN,zh;q=0.9",
                "cookie": "locale=zh-cn"
            }
        })).json())[jFullNumber.toUpperCase()]
        if (!rawData) {
            return null
        }
    } catch (error) {
        console.error(error)
        return null
    }

    retData = {
        jFullNumber: jFullNumber.toUpperCase(),
        workTitle: rawData.work_name,
        circleName: rawData.maker_id,
        releaseDate: new Date(rawData.regist_date).toISOString().slice(0, 10),
        vas: [],
        cover: rawData.work_image?.slice(2),
        language_editions: (rawData.dl_count_items ?? []).map((item: Record<string, any>) => ({
            id: jNumCoder.toCode(item.workno),
            lang: item.label,
            title: item.workno,
            source_id: item.workno,
            is_original: false,
            source_type: "DLSITE"
        }) as WorkMeta["language_editions"][number]),
        tags: []
    }
    return retData
}

export const fullFillWorkInfo = ({ jFullNumber, workTitle = "", circleName = "\0", releaseDate = "\0", vas = [], cover = "//", language_editions = [], tags = [] }: WorkMeta): WorkInfo => {
    return {
        id: jNumCoder.toCode(jFullNumber),
        title: workTitle || jFullNumber,
        circle_id: 0,
        name: circleName,
        nsfw: true,
        release: releaseDate,
        dl_count: 0,
        price: 0,
        review_count: 0,
        rate_count: 0,
        rate_average_2dp: 0,
        rate_count_detail: [],
        rank: [],
        has_subtitle: false,
        create_date: releaseDate,
        vas: [
            { id: objCoder.encode({ t: "circle", v: circleName }), name: `GP:${circleName}` },
            ...vas.map(va => ({ id: objCoder.encode({ t: "va", v: va }), name: `VA:${va}` })),
            ...tags
        ],
        tags: [],
        language_editions: [],
        original_workno: null,
        other_language_editions_in_db: language_editions,
        translation_info: {
            lang: null,
            is_child: false,
            is_parent: false,
            is_original: true,
            is_volunteer: false,
            child_worknos: [],
            parent_workno: null,
            original_workno: null,
            is_translation_agree: true,
            translation_bonus_langs: [],
            is_translation_bonus_child: false,
            translation_status_for_translator: {}
        },
        work_attributes: "",
        age_category_string: "adult",
        duration: 0,
        source_type: "DLSITE",
        source_id: jFullNumber,
        source_url: `getRemoteDomain()/maniax/work/=/product_id/${jFullNumber}.html`,
        userRating: null,
        review_text: null,
        progress: null,
        updated_at: null,
        user_name: null,
        circle: {
            id: 0,
            name: "\0",
            source_id: null,
            source_type: "DLSITE"
        },
        samCoverUrl: cover,
        thumbnailCoverUrl: cover,
        mainCoverUrl: cover
    }
}