import type { TrackFuncParam } from "@/types/api"
import { tracks as tracks_jasmr } from "./jasmr";
import { tracks as tracks_hentaiasmr } from "./hentaiasmr";
import { tracks as tracks_japaneseasmr } from "./japaneseasmr";
import { tracks as tracks_asmr18fans } from "./asmr18fans";

export default async ({ jFullNumber }: TrackFuncParam['params']): Promise<TrackFuncParam['result']> => {
    const ignoreEmpty = (p: Promise<any>) =>
        p.then(v => {
            if (!v || v.length === 0) throw new Error("empty");
            return v;
        });

    const tracks = await Promise.any([
        ignoreEmpty(tracks_asmr18fans({ jFullNumber })),
        ignoreEmpty(tracks_jasmr({ jFullNumber })),
        ignoreEmpty(tracks_japaneseasmr({ jFullNumber })),
        ignoreEmpty(tracks_hentaiasmr({ jFullNumber })),
    ]).catch(() => null);


    let ret: TrackFuncParam["result"] = []
    for (const track of tracks ?? []) {
        ret.push(
            {
                "type": "audio",
                "hash": "",
                "title": track.fileName,
                "work": {
                    "id": 0,
                    "source_id": `${jFullNumber}`,
                    "source_type": "DLSITE"
                },
                "workTitle": "",
                "mediaStreamUrl": track.fileUrl,
                "mediaDownloadUrl": track.fileUrl,
                "streamLowQualityUrl": track.fileUrl,
                "duration": track.duration ?? 0,
                "size": track.size ?? 0
            }
        )
    }
    return ret
}