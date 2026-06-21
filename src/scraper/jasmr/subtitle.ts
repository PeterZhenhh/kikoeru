import type { SubtitleQueryHash, TrackFileHash } from "@/types/api";
import * as cheerio from "cheerio";
import { type ApiVideo, getRemoteDomain, type VideoTracks } from "./";

export default async (
    fileHashObj: TrackFileHash,
): Promise<SubtitleQueryHash<"jasmr">> => {
    if (fileHashObj.source != "jasmr") return Promise.reject();
    const jNum = fileHashObj.id;
    if (!jNum) return Promise.reject();

    const ret: SubtitleQueryHash<"jasmr"> = {
        source: "jasmr",
        id: jNum,
        type: "subtitle-lrc",
    };
    return ret;
};

export const streamLrc = async (
    fileHashObj: SubtitleQueryHash<"jasmr">,
): Promise<string> => {
    const secToLrcTime = (seconds: number): string => {
        const mm = Math.floor(seconds / 60);
        const ss = Math.floor(seconds % 60);
        const xx = Math.floor((seconds % 1) * 100);

        return `[${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(xx).padStart(2, "0")}]`;
    };
    const url = `${getRemoteDomain()}/api/v1/videos?code=${fileHashObj.id}`;
    let html: ApiVideo;
    const lines: string[] = [];

    try {
        console.log(url);

        html = await (
            await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    referer: `https://www.jasmr.net/watch/${fileHashObj.id}`,
                },
            })
        ).json();
    } catch (error) {
        console.log(error);
        return Promise.reject();
    }

    // 解析章节
    const title =
        html.title.chinese ||
        html.title.japanese ||
        html.title.english ||
        fileHashObj.id;
    let lrcTime: number = 0;
    lines.push(`${secToLrcTime(lrcTime)}${title}`);
    const tracks = JSON.parse(html.tracks) as VideoTracks;
    tracks.forEach((track) => {
        const time = secToLrcTime(lrcTime);
        lrcTime += track.length;
        const text =
            track.title.chinese || track.title.japanese || track.title.english;
        lines.push(`${time}${text}`);
    });

    return lines.join("\n");
};
