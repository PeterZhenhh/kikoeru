import type { MediaStreamRespFunc } from "@/types/api";
import { mediaStream as mediaStream_asmrone } from "./asmrone";
import { mediaStream as mediaStream_japaneseasmr } from "./japaneseasmr";

export default async ({
    fileHashObj,
}: MediaStreamRespFunc["params"]): Promise<MediaStreamRespFunc["result"]> => {
    const result = await Promise.any([
        mediaStream_asmrone(fileHashObj),
        mediaStream_japaneseasmr(fileHashObj),
    ]).catch(() => null);
    return new Response(result);
};
