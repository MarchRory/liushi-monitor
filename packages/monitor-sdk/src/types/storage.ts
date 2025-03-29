import { RequestBundlePriorityEnum } from ".";

export type ReportDataStorageType = {
    [key in RequestBundlePriorityEnum]: string[]
}

export type StorageOrder<K extends RequestBundlePriorityEnum = RequestBundlePriorityEnum> =
    { type: 'update', category: K, data: string[] } |
    { type: 'clear', category: K } |
    { type: 'clearAll' } 