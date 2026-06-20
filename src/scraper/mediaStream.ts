import type { MediaStreamRespFunc } from "@/types/api"
import { mediaStream as mediaStream_asmrone } from "./asmrone"

const ignoreEmpty = async (
    p: Promise<any>
): Promise<any> => {
    const v = await p;
    if (!v) throw new Error("empty");
    return v;
};

export default async ({ fileHashObj }: MediaStreamRespFunc["params"]): Promise<MediaStreamRespFunc["result"]> => {
    const data = await Promise.any([
        ignoreEmpty(mediaStream_asmrone(fileHashObj)),
    ]) || null
    return new Response(data)
}