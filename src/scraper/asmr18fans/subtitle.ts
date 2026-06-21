import type { SubtitleQueryHash, TrackFileHash } from "@/types/api";
import * as cheerio from "cheerio";
import { getRemoteDomain } from "./";

export default async (
    fileHashObj: TrackFileHash,
): Promise<SubtitleQueryHash<"asmr18fans">> => {
    if (fileHashObj.source != "asmr18fans") return Promise.reject();
    const jNum = fileHashObj.id;
    if (!jNum) return Promise.reject();

    const ret: SubtitleQueryHash<"asmr18fans"> = {
        source: "asmr18fans",
        id: jNum.toLowerCase(),
        type: "subtitle-lrc",
    };
    return ret;
};

export const streamLrc = async (
    fileHashObj: SubtitleQueryHash<"asmr18fans">,
): Promise<string> => {
    const secToLrcTime = (seconds: number): string => {
        const mm = Math.floor(seconds / 60);
        const ss = Math.floor(seconds % 60);
        const xx = Math.floor((seconds % 1) * 100);

        return `[${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(xx).padStart(2, "0")}]`;
    };
    const url = `https://asmr18.fans/boys/${fileHashObj.id}/`;
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

    // 解析章节
    const $ = cheerio.load(html);
    $("#chapter a").each((_, el) => {
        const $el = $(el);

        const seconds = Number($el.attr("data-value") || "0");

        // 去掉 span，只保留文本
        const text = $el.clone().children("span").remove().end().text().trim();

        const time = secToLrcTime(seconds);

        lines.push(`${time}${text}`);
    });

    return lines.join("\n");
};
