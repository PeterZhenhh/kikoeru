import type { BaseTrackFile, TrackRespFunc } from "@/types/api"
import type { AppEnv } from "../../types/hono.ts";
import * as cheerio from "cheerio";
import { tryGetContext } from 'hono/context-storage'

export const tracks = async ({ jFullNumber }: TrackRespFunc['params']): Promise<BaseTrackFile[] | null> => {
    console.log(`Fetching tracks for ${jFullNumber} from asmr18fans...`);
    const url = `https://asmr18.fans/boys/${jFullNumber.toLowerCase()}`
    let html: string
    try {
        console.log(url);
        
        html = await (await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": url
            }
        })).text();
    }
    catch (error) {
        console.error(`Error fetching tracks for ${jFullNumber} from asmr18fans:`, error);
        return null
    }

    const $ = cheerio.load(html);

    // 提取所有 label 文本
    const labels = $(".tabs label.tab_item")
        .map((_, el) => $(el).text().trim())
        .get();


    let ret: BaseTrackFile[] = []
    labels.forEach(label => {
        ret.push(
            {
                type:"audio",
                fileName: `${label}_asmr18fans`,
                fileUrl: `https://cdn3.cloudintech.net/file/${jFullNumber.toUpperCase()}/${label.replace(" ", "+")}.m3u8`
            }
        )
    })

    return ret.length ? ret : null

}