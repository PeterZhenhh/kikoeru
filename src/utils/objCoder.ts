import type { ObjEncoded } from "../types/api"

export const decode = <T>(str: ObjEncoded<T>): T => {
    return JSON.parse(decodeURIComponent(str))
}

export const encode = <T>(obj: T): ObjEncoded<T> => {
    return encodeURIComponent(JSON.stringify(obj)) as ObjEncoded<T>
}
