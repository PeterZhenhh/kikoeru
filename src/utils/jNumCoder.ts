import * as codeReader from "./codeReader"
export const fromCode = (jCode: number) => {
    return codeReader.getNum(parseInt(jCode.toString().slice(0, 2)), "work") + jCode.toString().slice(2)
}

export const toCode = (jFullNumber: string) => {
    return parseInt(codeReader.getCode(jFullNumber.slice(0, 2), "work").toString() + jFullNumber.toString().slice(2))
}