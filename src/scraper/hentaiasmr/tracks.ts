import type { BaseTrackFile, TrackFuncParam } from "@/types/api"
import type { AppEnv } from "../../types/hono.ts";
import * as cheerio from "cheerio";
import { tryGetContext } from 'hono/context-storage'

export const tracks = async ({ jFullNumber }: TrackFuncParam['params']): Promise<BaseTrackFile[] | null> => {
    console.log(`Fetching tracks for ${jFullNumber} from hentaiasmr...`);
    const url = `https://hentaiasmr.moe/${jFullNumber.toLowerCase()}.html`
    let html: string
    try {
        console.log(url);
        
        const resp = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": url
            }
        })
        if (resp.status !== 200) {
            console.log(`hentaiasmr is blocked`);
            return null
        }
        html = await (resp).text();
    }
    catch (error) {
        console.error(`Error fetching tracks for ${jFullNumber} from hentaiasmr:`, error);
        return null
    }


    const $ = cheerio.load(html);
    const data = await tracks_multi($) ?? await tracks_single1($) ?? await tracks_single2($);
    const title = $("h2.entry-title[itemprop='name']")
        .first()
        .text()
        .trim();

    let ret: BaseTrackFile[] = []
    for (const track of data) {
        ret.push({
            type:"audio",
            fileName: `${track.title}_hentaiasmr`,
            fileUrl: new URL(`${tryGetContext<AppEnv>()?.env?.rprx_general || ""}${track.file}`).href
        })
    }
    return ret.length ? ret : null

}

export const tracks_multi = async ($: cheerio.CheerioAPI): Promise<{ file: string, title: string }[] | null> => {
    const trackss = [];

    for (const script of $("script").toArray()) {
        const content = $(script).html() ?? "";

        const re = /playlist\.push\s*\(\s*({[\s\S]*?})\s*\)\s*;/g;

        let match;

        while ((match = re.exec(content)) !== null) {
            try {
                const track = new Function(
                    `return (${match[1]})`
                )();

                trackss.push(track);
            } catch (e) {
                console.error(e);
            }
        }
    }

    if (!trackss.length) {
        return null
    }


    return trackss
}

export const tracks_single1 = async ($: cheerio.CheerioAPI): Promise<{ file: string, title: string }[] | null> => {
    const trackss = [];

    for (const script of $("script").toArray()) {
        const content = $(script).html() ?? "";

        const re = /file\s*:\s*["']([^"']+.+(?:\?[^"']*)?)["']/g;

        let match;

        while ((match = re.exec(content)) !== null) {
            try {
                const track = match[1]
                trackss.push({ file: track, title: track.split("/").pop()! });
            } catch (e) {
                console.error(e);
            }
        }
    }

    if (!trackss.length) {
        return null
    }
    return trackss
}

export const tracks_single2 = async ($: cheerio.CheerioAPI): Promise<{ file: string, title: string }[]> => {
    const audios = $("video source")
        .map((_, el) => ({
            file: $(el).attr("src")!,
            title: $(el).attr("title") || "track"
        }))
        .get();
    return audios;
}