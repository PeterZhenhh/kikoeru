import type { SubtitleQueryHash, TrackFileHash } from "@/types/api";
import { streamLrc } from "./subtitle";

export default async (
    fileHashObj: TrackFileHash | SubtitleQueryHash,
): Promise<BodyInit> => {
    if (fileHashObj.source != "asmr18fans") return Promise.reject();
    switch (fileHashObj.type) {
        case "subtitle-lrc":
            return streamLrc(fileHashObj);
        default:
            return Promise.reject();
    }
};
