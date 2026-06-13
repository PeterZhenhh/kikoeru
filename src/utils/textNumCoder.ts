import { toBigIntBE, toBufferBE } from "bigint-buffer";

// 字符串 -> BigInt
export const toBigInt = (text: string) => {
    const buf = Buffer.from(text, "utf8");
    return toBigIntBE(buf);
}

// BigInt -> 字符串
export const toText = (bigint: bigint | number) => {
    const hex = bigint.toString(16);
    const size = Math.ceil(hex.length / 2);

    const buf = toBufferBE(BigInt(bigint), size);
    return buf.toString("utf8");
}