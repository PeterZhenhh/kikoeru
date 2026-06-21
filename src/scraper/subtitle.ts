import type { CheckLrcRespFunc } from "@/types/api";
import { subtitle as subtitle_asmrone } from "./asmrone";
import { subtitle as subtitle_japaneseasmr } from "./japaneseasmr";
import * as objCoder from "@/utils/objCoder";

export default async ({
    fileHashObj,
}: CheckLrcRespFunc["params"]): Promise<CheckLrcRespFunc["result"]> => {
    if (!fileHashObj) return { result: false, hash: "", message: "" };
    const data = await Promise.any([
        subtitle_asmrone(fileHashObj),
        subtitle_japaneseasmr(fileHashObj),
    ]).catch(() => null);
    if (!data) return { result: false, hash: "", message: "" };
    return { result: true, hash: objCoder.encode(data), message: `OK` };
};
