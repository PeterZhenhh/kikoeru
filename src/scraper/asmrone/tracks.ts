import type { BaseTrackFile, TrackFuncParam } from "@/types/api"
import type { AppEnv } from "../../types/hono.ts";
import { tryGetContext } from 'hono/context-storage'
export const tracks = async ({ jFullNumber }: TrackFuncParam['params']): Promise<BaseTrackFile[] | null> => {
    console.log(`Fetching tracks for ${jFullNumber} from asmrone...`);
    const jNUm = jFullNumber.match(/\d+/)?.[0] ?? ""
    if (!jNUm) return null
    const url = `https://api.asmr.one/api/tracks/${jNUm}`
    let data: any
    try {
        console.log(url);

        const resp = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": `https://asmr.one`
            }
        })
        data = await resp.json()
    } catch (error) {
        console.error(`Error fetching tracks for ${jFullNumber} from asmrone:`, error);
        return null
    }

    if (!data.length) {
        return null
    }
    const ret: BaseTrackFile[] = toBaseTrackFiles(data)

    return ret
}

interface RawNode {
    type: "audio" | "folder"
    title: string
    children?: RawNode[]

    mediaDownloadUrl?: string
    duration?: number
    size?: number
    hash?: string
}

function toBaseTrackFiles(nodes: RawNode[]): BaseTrackFile[] {
    return nodes.flatMap(node => {
        if (node.type === "folder") {
            const children = toBaseTrackFiles(node.children ?? [])
            const ret: BaseTrackFile[] = [
                {
                    type: node.type,
                    fileName: node.title,
                    children
                }
            ].sort((a, b) => a.fileName > b.fileName ? 1 : -1)
            return ret
        }

        return [{
            type: node.type,
            fileName: node.title,

            fileUrl: new URL(`${tryGetContext<AppEnv>()?.env?.rprx_general || ""}${node.mediaDownloadUrl}`).href,
            duration: node.duration,
            size: node.size,
            hash: node.hash
        }]
    }).sort((a, b) => a.fileName > b.fileName ? 1 : -1)
}
