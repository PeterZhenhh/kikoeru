import type { AppEnv } from "./types/hono.ts";
import type {
    ObjEncoded,
    RemoteSearchParams,
    RespWorks,
    SearchWorkIdObj,
    TrackFileHash,
    SearchWorkType,
    SubtitleQueryHash,
} from "./types/api.ts";
import type { ClientSearchParams } from "./types/api.ts";
import type { Context } from "hono";
import type { WorkCode } from "./types/workMeta.ts";
import { Hono } from "hono/tiny";
import { contextStorage } from "hono/context-storage";
import { showRoutes } from "hono/dev";
import * as objCoder from "./utils/objCoder.ts";
import * as jNumCoder from "./utils/jNumCoder.ts";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { fullFillWorkInfo, fetchWorkMeta } from "./scraper/dlsite/product.ts";
import { stream } from "hono/streaming";
import searchRemoteWorks from "./scraper/search.ts";
import searchRemoteSubtitle from "./scraper/subtitle.ts";
import streamRemoteMedia from "./scraper/mediaStream.ts";
import { SEARCH_ORDER, SEARCH_SORT } from "./types/api.ts";

const app = new Hono<AppEnv>().basePath("/api");
app.use(contextStorage());

app.all("*", async (c, next) => {
    console.log(c.req.method, c.req.url);
    await next();
    return c.notFound();
});

// /api/auth/me
app.post("/auth/me", async (c, next) => {
    return c.json({
        user: {
            loggedIn: true,
            name: "user",
            group: "user",
            email: null,
            recommenderUuid: "",
        },
        token: "",
    });
});

// /api/health
app.get("/health", async (c, next) => {
    return c.text("OK");
});

// 搜索推荐列表
app.get("/tags", async (c, next) => {
    return c.json([]);
});

app.get("/circles", async (c, next) => {
    return c.json([]);
});

app.get("/vas", async (c, next) => {
    return c.json([]);
});

// 获取作品信息
app.get("/:_{workInfo|work}/:jCode", async (c, next) => {
    const jCode = parseInt(c.req.param("jCode")) as WorkCode;
    const jFullNumber = jNumCoder.fromCode(jCode);

    return streamJson(c, async () => {
        const workMeta = await fetchWorkMeta(jFullNumber);
        const data = fullFillWorkInfo(workMeta);
        return data;
    });
});

// 获取作品曲目文件
app.get("/tracks/:jCode", async (c, next) => {
    const jCode = parseInt(c.req.param("jCode")) as WorkCode;
    const jFullNumber = jNumCoder.fromCode(jCode);
    return streamJson(c, async () => {
        const data = await (
            await import("./scraper/tracks.ts")
        ).default({ jFullNumber });
        return data;
    });
});

const SearchSchema: z.ZodType<ClientSearchParams> = z.object({
    order: z.enum(SEARCH_ORDER).default(SEARCH_ORDER[0]),
    sort: z.enum(SEARCH_SORT).default(SEARCH_SORT[0]),
    page: z.coerce.number().int().min(1).default(1),
    subtitle: z.coerce
        .number()
        .pipe(z.union([z.literal(0), z.literal(1)]))
        .default(0),
});

//收藏
app.get("/review", zValidator("query", SearchSchema), async (c, next) => {
    const { order, sort, page } = c.req.valid("query");
    const ret = {
        works: [],
        pagination: { currentPage: page, pageSize: 0, totalCount: 0 },
    } as RespWorks;
    return c.json(ret);
});

//#region
// 作品搜索
// 主页探索
app.get("/works", zValidator("query", SearchSchema), async (c, next) => {
    const { order, sort, page, subtitle } = c.req.valid("query");

    const query: SearchWorkIdObj = { t: "keyword", v: "" };

    return streamJson(c, () =>
        searchAllWorks({
            searchType: query.t,
            searchKeyword: query.v,
            order,
            sort,
            page,
            subtitle,
        }),
    );
});

// 社团/标签/CV 搜索
app.get(
    "/:field{circle|tag|va}s/:data/works",
    zValidator("query", SearchSchema),
    async (c, next) => {
        const { order, sort, page, subtitle } = c.req.valid("query");
        const { data, field } = c.req.param() as {
            data: ObjEncoded<SearchWorkIdObj>;
            field: SearchWorkType;
        };
        let query: SearchWorkIdObj;
        switch (field) {
            case "circle":
            case "tag":
                query = { t: field, v: parseInt(data) };
                break;
            case "va":
                query = objCoder.decode(data);
                break;
            default:
                throw new Error(`Invalid field: ${field}`);
        }

        return streamJson(c, async () =>
            searchAllWorks({
                searchType: query.t,
                searchKeyword: query.v,
                order,
                sort,
                page,
                subtitle,
            }),
        );
    },
);

// 关键词 搜索
app.get(
    "/search/:keyword",
    zValidator("query", SearchSchema),
    async (c, next) => {
        const { order, sort, page, subtitle } = c.req.valid("query");
        const { keyword } = c.req.param();
        const query: SearchWorkIdObj = { t: "keyword", v: keyword };
        return streamJson(c, async () =>
            searchAllWorks({
                searchType: query.t,
                searchKeyword: query.v,
                order,
                sort,
                page,
                subtitle,
            }),
        );
    },
);

// 作品聚合搜索
const searchAllWorks = async (
    params: RemoteSearchParams,
): Promise<RespWorks> => {
    switch (params.searchType) {
        case "circle":
            console.log("社团搜索", params.searchKeyword);
            break;
        case "va":
            console.log("艺人搜索", params.searchKeyword);
            break;
        case "tag":
            console.log("标签搜索", params.searchKeyword);
            break;
        case "keyword":
            console.log("关键词搜索", params.searchKeyword);
            break;

        default:
            break;
    }

    return searchRemoteWorks(params);
};

// 其它过滤器搜索
app.get("/:filter/works", async (c, next) => {
    const filter = c.req.param("filter");
    console.log("查询过滤器", filter);
    return c.json({
        pagination: {
            currentPage: 1,
            pageSize: 20,
            totalCount: 0,
        },
        works: [],
    });
});
//#endregion

// 字幕搜索
app.get("/media/check-lrc/:fileHash{.*}", async (c, next) => {
    const { fileHash } = c.req.param() as {
        fileHash: ObjEncoded<TrackFileHash>;
    };
    if (!fileHash) return c.json({ result: false, hash: "", message: "" });
    const fileHashObj = objCoder.decode<TrackFileHash>(fileHash);

    return streamJson(c, async () => searchRemoteSubtitle({ fileHashObj }));
});

// 字幕文件导出
app.get("/media/stream/:fileHash{.*}", async (c, next) => {
    const { fileHash } = c.req.param() as {
        fileHash: ObjEncoded<TrackFileHash | SubtitleQueryHash>;
    };
    const fileHashObj = objCoder.decode(fileHash);
    return streamRemoteMedia({ fileHashObj });
});

showRoutes(app, {
    verbose: true,
});

export const streamJson = <T>(
    c: Context,
    fn: () => Promise<T>,
    heartbeatMs = 3000,
) => {
    return stream(c, async (s) => {
        c.header("Content-Type", "application/json; charset=utf-8");
        c.header("Cache-Control", "no-cache");

        let finished = false;
        let writing: Promise<void> = Promise.resolve();

        const write = (data: string): Promise<void> => {
            writing = writing.then(() => s.write(data).then(() => {}));

            return writing;
        };

        // 立即发送一个空白字符，促使 header/chunk 发出
        await write(" ");

        const timer = setInterval(() => {
            if (finished) return;

            // 继续发送 JSON 合法空白字符
            void write(" ");
        }, heartbeatMs);

        try {
            const result = await fn();

            finished = true;
            clearInterval(timer);

            // 等待所有 heartbeat 写完
            await writing;

            // 一次性输出完整 JSON
            await write(JSON.stringify(result));
        } catch (err) {
            finished = true;
            clearInterval(timer);

            await writing;

            throw err;
        }
    });
};

export default app;
