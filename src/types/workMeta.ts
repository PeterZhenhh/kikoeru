export type WorkMeta = {
    jFullNumber: string,
    workTitle: string,
    circleName: string,
    releaseDate: string,
    vas: string[],
    cover: URL["href"],
    language_editions: {
        // jCode
        id: number,
        lang: string,
        title: string,
        source_id: string,
        is_original: boolean,
        source_type: "DLSITE"
    }[],
    tags: {
        // objCoder.encode
        id: string,
        name: string
    }[]
}

export type RemoteWork = {
    size: number
    page: number
    total: number
    jFullNumber: string[]
}