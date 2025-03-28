import { IPluginTransportDataBaseInfo } from "monitor-sdk/src/types"

export type JsSyncErrorTransportData = IPluginTransportDataBaseInfo<'javaScript_sync_error', {
    syncError: {
        errorEvent?: string | Event
        sourceFile?: string
        codeLine?: number
        codeColumn?: number
        stackDetail?: {
            message?: string
            stack?: string
        },
    }[]
}>

export type UnCatchPromiseErrorTransportData = IPluginTransportDataBaseInfo<'uncatch_promise_error', {
    reason: PromiseRejectionEvent['reason']
}>

export type SourceErrorTransportData = IPluginTransportDataBaseInfo<'source_load_error', {
    nodeName: string
    attributes: Pick<Attr, 'name' | 'value'>[]
}>

export interface ISourceErrorTarget extends EventTarget {
    attributes: NamedNodeMap
    nodeName: Uppercase<string>
}   