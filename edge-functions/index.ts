import entry from "../dist/index";

export default async function onRequest(context: any) {
    return entry(context)
}