import { WorkMeta } from "./workMeta"

export type TrackFuncParam = {
    params: {
        jFullNumber: string
    }
    result: {
        type: string,
        hash: string,
        title: string,
        work?: {
            id: number,
            source_id: string,
            source_type: string
        },
        workTitle: string,
        mediaStreamUrl: string,
        mediaDownloadUrl: string,
        streamLowQualityUrl: string,
        duration: number,
        size: number
    }[] | null
}

export type BaseTrackFile = {
    fileName: string,
    fileUrl: URL["href"]
    duration?: number
    size?: number
}

export type SearchWorkParam = {
    t: SearchWorkType,
    v: any
}

export type TrackInfo = {
    title: string
}

type SearchWorkType =
    // 社团
    "circle" |
    // 艺人
    "va" |
    // 标签
    "tag" |
    // 关键词
    "keyword"

export type ClientSearchParams = {
    order:
    // 发布时间
    "release" |
    // 收录时间
    "created_at" |
    //  我的评价
    "post_views" |
    //  销售数量
    "dl_count" |
    //  出售价格
    "price" |
    //  总评价
    "rate_average_2dp" |
    //  评论数量
    "review_count" |
    //   RJ号
    "id" |
    //   年龄分级
    "nsfw" |
    //   随机排序
    "random" |
    //   标记时间
    "updated_at" |
    //   我的评价（收藏）
    "userRating"
    sort: "asc" | "desc"
    page: number
    subtitle: 0 | 1
}

export type RemoteSearchParams = {
    searchType: SearchWorkType,
    searchKeyword?: string
} & ClientSearchParams


export type RespWorks = {
    pagination: {
        currentPage: number,
        pageSize: number,
        totalCount: number
    },
    works: WorkInfo[]
}

export type WorkInfo = {
    id: number;
    title: string;
    circle_id: number;
    name: string;
    nsfw: boolean;
    release: string;
    dl_count: number;
    price: number;
    review_count: number;
    rate_count: number;
    rate_average_2dp: number;
    rate_count_detail: never[];
    rank: never[];
    has_subtitle: boolean;
    create_date: string;
    vas: {
        id: string;
        name: string;
    }[];
    tags: never[];
    language_editions: never[];
    original_workno: null;
    other_language_editions_in_db: {
        id: number;
        lang: string;
        title: string;
        source_id: string;
        is_original: boolean;
        source_type: "DLSITE";
    }[];
    translation_info: {
        lang: null;
        is_child: boolean;
        is_parent: boolean;
        is_original: boolean;
        is_volunteer: boolean;
        child_worknos: never[];
        parent_workno: null;
        original_workno: null;
        is_translation_agree: boolean;
        translation_bonus_langs: never[];
        is_translation_bonus_child: boolean;
        translation_status_for_translator: {};
    }
    work_attributes: string,
    age_category:number,
    age_category_string: string,
    duration: number,
    source_type: string,
    source_id: string,
    source_url: URL["href"],
    userRating: null,
    review_text: null,
    progress: null,
    updated_at: null,
    user_name: null,
    circle: {
        id: number,
        name: string,
        source_id: null,
        source_type: string
    },
    samCoverUrl: URL["href"],
    thumbnailCoverUrl: URL["href"],
    mainCoverUrl: string;
}