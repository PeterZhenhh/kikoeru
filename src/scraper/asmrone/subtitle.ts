import type { TrackFileHash } from "@/types/api";
import type { RawNode } from "./tracks"
import subConf from "./calSubConf"

export default async (fileHashObj: TrackFileHash): Promise<TrackFileHash | null> => {
    if (fileHashObj.source != "asmrone") return null
    const [JNum, fileId] = fileHashObj.id.split("/")
    if (!fileId) return null
    let trackInfoTree: RawNode[]
    try {
        const url = `https://api.asmr.one/api/tracks/${JNum}`
        trackInfoTree = await (await fetch(url, {
            headers: {
                "user-agent": "okhttp/5.0.0-alpha.11"
            },
        })).json() as RawNode[]
    } catch (error) {
        console.log(error);
        return null
    }

    let result: { hash: string, confidence: number }[] = []
    let wavName: string
    let wavDuration: number


    const walkFolder = (root: RawNode[], fn: (node: RawNode) => any) => {
        root.forEach(node => {
            if (node.type == "folder") walkFolder(node.children ?? [], fn)
            fn(node)
        })
    }

    walkFolder(trackInfoTree, (node) => {
        if (node.hash == fileHashObj.id) {
            wavName = node.title
            wavDuration = node.duration || 0
        }
    })
    if (!wavName!) return null

    walkFolder(trackInfoTree, (node) => {
        if (node.type != "text") return
        import("subsrt-ts")

        const isSubtitle = [".ass", ".lrc", ".sbv", ".smi", "srt", "ssa", "sub", "vtt"]
            .some(ext => node.title.toLowerCase().endsWith(ext))
        if (!isSubtitle) return
        result.push({ hash: node.hash!, confidence: subConf(wavName, wavDuration, node.title, node.duration || 0) })
    })

    result.sort((a, b) => a.confidence - b.confidence)
    const retHash = result.pop()?.hash
    if (!retHash) return null
    const ret: TrackFileHash = { source: "asmrone", id: retHash, type: "subtitle" }
    return ret


}