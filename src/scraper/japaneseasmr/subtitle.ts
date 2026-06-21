import type { SubtitleQueryHash, TrackFileHash } from "@/types/api";
import type { RemoteSearchParams } from "@/types/api";
import { searchAllInPage } from "./search";
import { getRemoteDomain } from "./";
import * as cheerio from "cheerio";

export default async (
    fileHashObj: TrackFileHash,
): Promise<SubtitleQueryHash> => {
    if (fileHashObj.source != "japaneseasmr") return Promise.reject();
    const jNum = fileHashObj.id;
    if (!jNum) return Promise.reject();
    const clientSP: RemoteSearchParams = {
        order: "release",
        page: 1,
        searchKeyword: `${jNum}`,
        searchType: "keyword",
        sort: "desc",
        subtitle: 1,
    };

    const resp = await searchAllInPage(clientSP);
    const pageId = resp.pageIds[jNum];
    if (!pageId) return Promise.reject();

    const ret: SubtitleQueryHash = {
        source: "japaneseasmr",
        pageId,
        type: "subtitle-lrc",
    };
    return ret;
};

export const streamLrc = async (
    fileHashObj: SubtitleQueryHash<"japaneseasmr">,
): Promise<string> => {
    const secToLrcTime = (seconds: number): string => {
        const mm = Math.floor(seconds / 60);
        const ss = Math.floor(seconds % 60);
        const xx = Math.floor((seconds % 1) * 100);

        return `[${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(xx).padStart(2, "0")}]`;
    };

    const url = `${getRemoteDomain()}/${fileHashObj.pageId}/`;
    let html: string;
    const lines: string[] = [];

    try {
        console.log(url);

        html = await (
            await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    referer: `${getRemoteDomain()}`,
                },
            })
        ).text();
    } catch (error) {
        console.log(error);
        return Promise.reject();
    }
    const $ = cheerio.load(html);
    $("#plyr-chapter-playlist tr").each((_, tr) => {
        const timeEl = $(tr).find("td.start_time a");
        const titleEl = $(tr).find("td.chapter_title a");

        const seconds = Number(timeEl.attr("data-value"));
        const title =
            titleEl.attr("data-track-title")?.trim() || titleEl.text().trim();

        if (!Number.isFinite(seconds) || !title) {
            return; // 跳过表头
        }

        lines.push(`${secToLrcTime(seconds)}${title}`);
    });

    return lines.join("\n");
};
