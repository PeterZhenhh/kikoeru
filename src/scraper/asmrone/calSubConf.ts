function levenshtein(a: string, b: string): number {
    const dp: number[][] = Array.from(
        { length: a.length + 1 },
        () => Array(b.length + 1).fill(0)
    )

    for (let i = 0; i <= a.length; i++) dp[i][0] = i
    for (let j = 0; j <= b.length; j++) dp[0][j] = j

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + 1
                )
        }
    }

    return dp[a.length][b.length]
}

function normalizeFilename(filename: string): string {
    let name = filename

    // 去扩展名
    const idx = name.lastIndexOf(".")
    if (idx !== -1) {
        name = name.slice(0, idx)
    }

    // 删除常见音频扩展名字符串
    name = name.replace(
        /(wav|flac|mp3|m4a|mp4|ogg|aac)/gi,
        ""
    )

    // 只保留字母数字
    return name.replace(/[^a-zA-Z0-9]/g, "")
}

function filenameScore(
    audioName: string,
    subtitleName: string
): number {
    const a = normalizeFilename(audioName)
    const b = normalizeFilename(subtitleName)

    if (!a.length) {
        return 0
    }

    const distance = levenshtein(a, b)
    const score = Math.abs((a.length - distance) / a.length)

    return Math.min(score, 1)
}

function durationScore(
    audioDuration: number,
    subtitleDuration: number
): number {
    if (subtitleDuration - audioDuration > 5) {
        return 0
    }

    return (Math.min(audioDuration, subtitleDuration) / Math.max(audioDuration, subtitleDuration)) || 0
}

export default (
    audioName: string,
    audioDuration: number,
    subtitleName: string,
    subtitleDuration: number
): number => {

    // 特判：同名 vtt
    const audioBase = audioName.replace(/\.[^.]+$/, "")
    if (subtitleName === `${audioBase}.vtt`) {
        return 1
    }

    const name = filenameScore(
        audioName,
        subtitleName
    )

    const duration = durationScore(
        audioDuration,
        subtitleDuration
    )

    return 0.3 * name + 0.7 * duration
}
