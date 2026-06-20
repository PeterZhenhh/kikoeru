import type { TrackFileHash } from "@/types/api";

const convertSubtitle = async (rawText: string, targetFormat: string) => {
    let from = rawText
    const subsrt = await import("subsrt-ts")
    const to = subsrt.convert(from, { format: targetFormat, to: targetFormat });
    return to.replaceAll("\r\n", "\n");
}

export default async (fileHashObj: TrackFileHash): Promise<string | null> => {
    if (fileHashObj.source != "asmrone" || fileHashObj.type != "subtitle") return null
    const url = `https://api.asmr.one/api/media/stream/${fileHashObj.id}`
    let subRawText: string
    try {
        console.log(url);

        subRawText = await (await fetch(url, {
            headers: {
                "user-agent": "okhttp/5.0.0-alpha.11",
            },
        })).text()
    } catch (error) {
        console.log(error);
        return null
    }

    const lrc = await convertSubtitle(subRawText, "lrc")
    return lrc
}