import type { BaseTrackFile, TrackRespFunc } from "@/types/api";
import { getRemoteDomain, type ApiVideo } from "./";
import * as objCoder from "../../utils/objCoder.ts";
export const tracks = async ({
    jFullNumber,
}: TrackRespFunc["params"]): Promise<BaseTrackFile[]> => {
    console.log(`Fetching tracks for ${jFullNumber} from jasmr...`);
    const url = `${getRemoteDomain()}/api/v1/videos?code=${jFullNumber}`;
    let data: ApiVideo;
    try {
        console.log(url);

        const resp = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                referer: `https://www.jasmr.net/watch/${jFullNumber}`,
            },
        });
        data = await resp.json();
    } catch (error) {
        console.error(
            `Error fetching tracks for ${jFullNumber} from jasmr:`,
            error,
        );
        return Promise.reject(error);
    }
    if (!data || !data.source) {
        return Promise.reject();
    }
    const ret: BaseTrackFile[] = [
        {
            type: "audio",
            fileName: `${data?.title?.chinese || data?.title?.japanese || data?.title?.english || `${jFullNumber}`}_jasmr`,
            fileUrl: new URL(`${getRemoteDomain()}${data.source}`).href,
            hash: objCoder.encode({
                source: "jasmr",
                type: "audio",
                id: jFullNumber,
            }),
        },
    ];
    return ret;
};
