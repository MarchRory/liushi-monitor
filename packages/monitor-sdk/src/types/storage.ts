import { MonitorTypes } from "./logger";

export type ReportDataStorageType = {
    [key in MonitorTypes]: string[]
}

export type StorageOrder<K extends MonitorTypes = MonitorTypes> =
    { type: 'update', category: K, data: string[] } |
    { type: 'clear', category: K } |
    { type: 'clearAll' } |
    { type: 'saveBeforeUnload', category: K, data: string[] }