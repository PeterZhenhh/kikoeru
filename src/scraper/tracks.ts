import type { TrackRespFunc, BaseTrackFile } from "@/types/api";
import type { WorkFullNumber } from "@/types/workMeta";
import { tracks as tracks_jasmr } from "./jasmr";
import { tracks as tracks_hentaiasmr } from "./hentaiasmr";
import { tracks as tracks_japaneseasmr } from "./japaneseasmr";
import { tracks as tracks_asmr18fans } from "./asmr18fans";
import { tracks as tracks_asmrone } from "./asmrone";

export default async ({
    jFullNumber,
}: TrackRespFunc["params"]): Promise<TrackRespFunc["result"][]> => {
    const tracks: BaseTrackFile[] = await tracks_asmrone({ jFullNumber })
        .catch(() =>
            Promise.any([
                tracks_jasmr({ jFullNumber }),
                tracks_japaneseasmr({ jFullNumber }),
                tracks_hentaiasmr({ jFullNumber }),
                tracks_asmr18fans({ jFullNumber }),
            ]),
        )
        .catch(() => []);

    function convertTrack(
        track: BaseTrackFile,
        jFullNumber: WorkFullNumber,
    ): TrackRespFunc["result"] {
        if (track.type === "folder") {
            return {
                type: "folder",
                title: track.fileName,
                children: track.children.map((child) =>
                    convertTrack(child, jFullNumber),
                ),
            };
        }
        return {
            type: track.type,
            hash: track.hash ?? "",
            title: track.fileName,
            work: {
                id: 0,
                source_id: jFullNumber,
                source_type: "DLSITE",
            },
            workTitle: "",
            mediaStreamUrl: track.fileUrl,
            mediaDownloadUrl: track.fileUrl,
            streamLowQualityUrl: track.fileUrl,
            duration: track.duration ?? 0,
            size: track.size ?? 0,
        };
    }
    const ret = tracks.map((track) =>
        convertTrack(track, `${jFullNumber}`),
    ) as TrackRespFunc["result"][];
    return ret;
};
