import type { ObjEncoded, RemoteSearchParams, RespWorks, SearchWorkParam, WorkInfo } from "@/types/api";
import { search as search_jasmr } from "./jasmr";
import { search as search_hentaiasmr } from "./hentaiasmr";
import { search as search_japaneseasmr } from "./japaneseasmr";
import { search as search_asmr18fans } from "./asmr18fans";
import { search as search_asmrone } from "./asmrone";
import { fullFillWorkInfo, fetchWorkMeta } from "./dlsite/product";
import * as objCoder from "../utils/objCoder"

export default async (params: RemoteSearchParams): Promise<RespWorks> => {
    const dataSources = [
        search_jasmr(params),
        search_japaneseasmr(params),
        search_hentaiasmr(params),
        search_asmr18fans(params),
        search_asmrone(params)
    ]

    const results = await Promise.all(dataSources);

    // 1. 合并 + 去重
    const jFullNumbers = [
        ...new Set(results.flatMap(item => item.jFullNumber))
    ];
    console.log(`Search rough result: ${jFullNumbers.length}`);


    // 2. 并发拉详情
    const entries = await Promise.all(
        jFullNumbers.map(async (jnum) => {
            const meta = await fetchWorkMeta(jnum);
            const info = fullFillWorkInfo(meta);
            return [jnum, info] as const;
        })
    );

    console.log(`Search workmeta result: ${entries.length}`);

    const jInfo: Record<string, WorkInfo> = Object.fromEntries(entries);

    // 3. 拼 works（如果你需要）
    let works: WorkInfo[] = jFullNumbers
        .map(jnum => jInfo[jnum])
        .filter(Boolean)
        // 选定分类筛选
        .filter(work => {
            if (params.searchType == "va" || params.searchType == "circle" || params.searchType == "tag") {
                for (const v of work.vas) {
                    const raw = objCoder.decode<SearchWorkParam>(v.id as ObjEncoded<SearchWorkParam>)
                    if (raw.t == params.searchType && raw.v == params.searchKeyword) return true
                }
                return false
            }
            return true
        })
        // CV单人限定筛选
        .filter(work => {
            if (params.searchType == "va" && params.subtitle) {
                for (const v of work.vas) {
                    const raw = objCoder.decode<SearchWorkParam>(v.id as ObjEncoded<SearchWorkParam>)
                    if (raw.t == params.searchType && raw.v != params.searchKeyword) return false
                }
            }
            return true
        })
        // 4. 重排序
        .sort((a, b) => {
            let c: number = 0;
            let d: number = 0;
            switch (params.order) {
                case "release":
                case "created_at":
                case "updated_at":
                    c = new Date(a.create_date).getTime()
                    d = new Date(b.create_date).getTime()
                    break
                case "userRating":
                case "rate_average_2dp":
                case "post_views":
                case "rating":
                    c = a.rate_average_2dp
                    d = b.rate_average_2dp
                    break
                case "dl_count":
                    c = a.dl_count
                    d = b.dl_count
                    break
                case "price":
                    c = a.price
                    d = b.price
                    break
                case "review_count":
                    c = a.rate_count
                    d = b.rate_count
                    break
                case "id":
                    c = a.id
                    d = b.id
                    break
                case "nsfw":
                    c = a.age_category
                    d = b.age_category
                    break
                case "random":
                    c = Math.random()
                    d = Math.random()
                    break
                default:
                    break;
            }

            switch (params.sort) {
                case "asc":
                    return (c || 0) - (d || 0)
                case "desc":
                    return (d || 0) - (c || 0)
                default:
                    return 0
            }
        })

    // Full jNumber matching
    if (params.searchType == "keyword") {
        for (const work of works) {
            if (params.searchKeyword?.toUpperCase() == work.source_id.toUpperCase()) {
                works.unshift(work)
                break
            }
        }
    }

    console.log(`Search final result: ${entries.length}`);

    return {
        pagination: {
            currentPage: params.page,
            // pageSize: results.reduce((sum, item) => sum + item.size, 0),
            // totalCount: results.reduce((sum, item) => sum + item.total, 0),
            pageSize: 0,
            totalCount: results.reduce((sum, item) => sum + item.jFullNumber.length, 0) > 0 ? 1 : 0
        },
        works,
    };
};