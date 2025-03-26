import { RequestBundlePriorityEnum } from ".";
import { MonitorTypes } from "./logger";

export type ReportDataStorageType = {
    [key in RequestBundlePriorityEnum]: string[][]
}

export type StorageOrder<K extends RequestBundlePriorityEnum = RequestBundlePriorityEnum> =
    { type: 'update', category: K, data: string[][] } |
    { type: 'clear', category: K } |
    { type: 'clearAll' } 