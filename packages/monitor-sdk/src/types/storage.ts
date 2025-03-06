import { MonitorTypes } from "./logger";

export type ReportDataStorageType = {
    [key in MonitorTypes]: object[]
}

export type StorageOrder<K extends MonitorTypes = MonitorTypes> =
    { type: 'update', category: K, data: object[] } |
    { type: 'clear', category: K } |
    { type: 'clearAll' }