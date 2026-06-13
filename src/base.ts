import type { AppEnv } from "./types/hono";
import type { RemoteSearchParams, SearchWorkParam } from "./types/api"
import type { ClientSearchParams } from "./types/api";
import { Hono } from "hono/tiny";
import { showRoutes } from 'hono/dev'
import * as objCoder from "./utils/objCoder"
import * as jNumCoder from "./utils/jNumCoder"
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { fullFillWorkInfo, fetchWorkMeta } from "./scraper/dlsite/product"
import searchRemoteWorks from "./scraper/search.ts"

const app = new Hono<AppEnv>().basePath('/api');

app.all("*", async (c, next) => {
  console.log(c.req.method, c.req.url)
  await next()
  return c.notFound()
})

// /api/auth/me
app.post("/auth/me", async (c, next) => {

  return c.json(
    {
      user: {
        loggedIn: true,
        name: "user",
        group: "user",
        email: null,
        recommenderUuid: ""
      },
      token: ""
    }
  )
});

// /api/health
app.get("/health", async (c, next) => {

  return c.text("OK")
});



// 获取作品信息
app.get("/:_{workInfo|work}/:jCode", async (c, next) => {
  const jCode = parseInt(c.req.param("jCode"))
  const jFullNumber = jNumCoder.fromCode(jCode)
  const workMeta = await fetchWorkMeta(jFullNumber)
  const data = fullFillWorkInfo(workMeta)
  return c.json(data);
});


// 获取作品曲目文件
app.get("/tracks/:jCode", async (c, next) => {
  const jCode = parseInt(c.req.param("jCode"))
  const jFullNumber = jNumCoder.fromCode(jCode)
  const data = await (await import("./scraper/tracks.ts")).default({ jFullNumber })

  return c.json(data);
});


//#region 
// 作品搜索

// /api/works
const SearchSchema: z.ZodType<ClientSearchParams> = z.object({
  order: z.enum([
    "release",
    "created_at",
    "rating",
    "dl_count",
    "price",
    "rate_average_2dp",
    "review_count",
    "id",
    "nsfw",
    "random"
  ]).default("created_at"),
  sort: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  subtitle: z.coerce.number().pipe(
    z.union([z.literal(0), z.literal(1)])
  ).default(0)
})
app.get("/works", zValidator("query", SearchSchema), async (c, next) => {
  const { order, sort, page, subtitle } = c.req.valid("query")

  const data = {
    pagination: {
      "currentPage": 1,
      "pageSize": 20,
      "totalCount": 1
    },
    works: [
      fullFillWorkInfo(await fetchWorkMeta("RJ300204"))
    ]
  }
  return c.json(data);
});

// 社团/标签/CV 搜索
app.get("/:field{circle|tag|va}s/:data/works", zValidator("query", SearchSchema), async (c, next) => {
  const { order, sort, page, subtitle } = c.req.valid("query")
  const { data, field } = c.req.param()
  let query: SearchWorkParam
  switch (field) {
    case "circle":
    case "tag":
      query = { t: field, v: parseInt(data) }
      break;
    case "va":
      query = objCoder.decode(data)
      break
    default:
      throw new Error(`Invalid field: ${field}`)
  }

  return c.json(await searchAllWorks({ searchType: query.t, searchKeyword: query.v, order, sort, page, subtitle }))
});

// 关键词 搜索
app.get("/search/:keyword", zValidator("query", SearchSchema), async (c, next) => {
  const { order, sort, page, subtitle } = c.req.valid("query")
  const { keyword } = c.req.param()
  const query: SearchWorkParam = { t: "keyword", v: keyword }
  return c.json(await searchAllWorks({ searchType: query.t, searchKeyword: query.v, order, sort, page, subtitle }))
})

// 作品聚合搜索
const searchAllWorks = async (params: RemoteSearchParams) => {
  switch (params.searchType) {
    case "circle":
      console.log("社团搜索", params.searchKeyword)
      break;
    case "va":
      console.log("艺人搜索", params.searchKeyword)
      break;
    case "tag":
      console.log("标签搜索", params.searchKeyword)
      break;
    case "keyword":
      console.log("关键词搜索", params.searchKeyword)
      break;

    default:
      break;
  }

  return searchRemoteWorks(params)
}

// 其它过滤器搜索
app.get("/:filter/works", async (c, next) => {
  const filter = c.req.param("filter")
  console.log("查询过滤器", filter)
  return c.json(
    {
      pagination: {
        "currentPage": 1,
        "pageSize": 20,
        "totalCount": 0
      },
      works: []
    }
  )
});
//#endregion


showRoutes(app, {
  verbose: true,
})

export default app
