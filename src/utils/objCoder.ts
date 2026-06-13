export const decode = (str: string) => {
    return JSON.parse(decodeURIComponent(str))
}

export const encode = (obj: object) => {
    return encodeURIComponent(JSON.stringify(obj))
}
