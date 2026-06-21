import * as codeReader from "./codeReader"
import type { WorkCode, WorkFullNumber } from "@/types/workMeta"


export const fromCode = (jCode: WorkCode): WorkFullNumber => {

    return `${codeReader.getNum(parseInt(jCode.toString().slice(0, 2)), "work")}${jCode.toString().slice(2)}` as WorkFullNumber
}

export const toCode = (jFullNumber: WorkFullNumber): WorkCode => {
    return parseInt(`${codeReader.getCode(jFullNumber.slice(0, 2), "work").toString()}${jFullNumber.toString().slice(2)}`) as WorkCode
}