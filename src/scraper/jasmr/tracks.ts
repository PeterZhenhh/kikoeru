import type { BaseTrackFile, TrackFuncParam } from "@/types/api"
export const tracks = async ({ jFullNumber }: TrackFuncParam['params']): Promise<BaseTrackFile[] | null> => {
    console.log(`Fetching tracks for ${jFullNumber} from jasmr...`);
    const url = `https://www.jasmr.net/api/v1/videos?code=${jFullNumber}`
    let data: any
    try {
        console.log(url);
        
        const resp = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": `https://www.jasmr.net/watch/${jFullNumber}`
            }
        })
        data = await resp.json()
    } catch (error) {
        console.error(`Error fetching tracks for ${jFullNumber} from jasmr:`, error);
        return null
    }
    if (!data || !data.source) {
        return null
    }
    const ret: BaseTrackFile[] = [{
        type: "audio",
        fileName: `${data?.title?.chinese || data?.title?.japanese || data?.title?.english || `${jFullNumber}`}_jasmr`,
        fileUrl: new URL(`https://www.jasmr.net${data.source}`).href
    }]
    return ret
}