import type { RemoteSearchParams, RespWorks, WorkInfo } from "@/types/api";
import search_jasmr from "./jasmr/search";
import search_japaneseasmr from "./japaneseasmr/search";
import { fullFillWorkInfo, fetchWorkMeta } from "./dlsite/product";

export default async (params: RemoteSearchParams): Promise<RespWorks> => {
    const dataSources = [
        search_jasmr(params),
        // search_japaneseasmr(params)
    ]

    const results = await Promise.all(dataSources);

    // 1. 合并 + 去重
    const jFullNumbers = [
        ...new Set(results.flatMap(item => item.jFullNumber))
    ];

    // 2. 并发拉详情
    const entries = await Promise.all(
        jFullNumbers.map(async (jnum) => {
            const meta = await fetchWorkMeta(jnum);
            const info = fullFillWorkInfo(meta);
            return [jnum, info] as const;
        })
    );

    const jInfo: Record<string, WorkInfo> = Object.fromEntries(entries);

    // 3. 拼 works（如果你需要）
    const works: WorkInfo[] = jFullNumbers
        .map(jnum => jInfo[jnum])
        .filter(Boolean);

    return {
        pagination: {
            currentPage: params.page,
            pageSize: results.reduce((sum, item) => sum + item.size, 0),
            totalCount: results.reduce((sum, item) => sum + item.total, 0),
            // pageSize:0,
            // totalCount:1
        },
        works,
    };
};