import type { BaseTrackFile, TrackFuncParam } from "@/types/api"
import * as cheerio from "cheerio";

export const tracks = async ({ jFullNumber }: TrackFuncParam['params']): Promise<BaseTrackFile[] | null> => {
    console.log(`Fetching tracks for ${jFullNumber} from hentaiasmr...`);
    const url = `https://hentaiasmr.moe/${jFullNumber.toLowerCase()}.html`
    let html: string
    try {
        html = await (await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": url
            }
        })).text();
    }
    catch (error) {
        console.error(`Error fetching tracks for ${jFullNumber} from hentaiasmr:`, error);
        return null
    }


    const $ = cheerio.load(html);
    const data = await tracks_multi($) ?? await tracks_single($);
    const title = $("h2.entry-title[itemprop='name']")
        .first()
        .text()
        .trim();

    let ret: BaseTrackFile[] = []
    for (const track of data) {
        ret.push({
            fileName: track.title,
            fileUrl: new URL(`${track.file}`).href
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

export const tracks_single = async ($: cheerio.CheerioAPI): Promise<{ file: string, title: string }[]> => {
    const audios = $("video source")
        .map((_, el) => ({
            file: $(el).attr("src")!,
            title: $(el).attr("title") || "track"
        }))
        .get();
    return audios;
}