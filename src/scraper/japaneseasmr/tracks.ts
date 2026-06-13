import type { BaseTrackFile, TrackFuncParam } from "@/types/api"
async function exists(url: URL["href"]): Promise<boolean> {
    try {
        const res = await fetch(url, {
            method: "HEAD",
            redirect: "follow",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "referer": "https://japaneseasmr.com",
                "origin": "https://japaneseasmr.com"
            }
        });

        return res.ok;
    } catch {
        return false;
    }
}

export const tracks = async ({ jFullNumber }: TrackFuncParam['params']): Promise<BaseTrackFile[] | null> => {
    console.log(`Fetching tracks for ${jFullNumber} from japaneseasmr...`);
    const rj = jFullNumber;

    // 1. 检查封面
    const cover = `https://pic.weeabo0.xyz/${rj.toUpperCase()}_img_main.jpg`;

    if (!(await exists(cover))) {
        return null;
    }

    let result: BaseTrackFile[] = []

    // 2. 检查 m3u8
    const m3u8 = `https://v.weeab0o.xyz/${rj.toUpperCase()}.m3u8`;

    if (await exists(m3u8)) {
        result.push({
            fileName: `${rj.toUpperCase()}.m3u8`,
            fileUrl: m3u8,
        });
        return result;
    }

    // 3. 检查 mp3
    const firstMp3 = `https://v.weeab0o.xyz/${rj.toUpperCase()}.mp3`;

    if (await exists(firstMp3)) {
        result.push({
            fileName: `${rj.toUpperCase()}_1.mp3`,
            fileUrl: firstMp3,
        });
    } else {
        return null
    }

    // 4. 检查 RJxxxx 2.mp3、RJxxxx 3.mp3 ...
    for (let i = 2; ; i++) {
        const url = `https://v.weeab0o.xyz/${rj.toUpperCase()} ${i}.mp3`;

        if (!(await exists(url))) {
            break;
        }

        result.push({
            fileName: `${rj.toUpperCase()}_${i}.mp3`,
            fileUrl: url,
        });
    }

    return result.length ? result : null
}