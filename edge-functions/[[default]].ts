import entry from "../dist/index";

export default function onRequest(context: any) {
    return entry(context)
}