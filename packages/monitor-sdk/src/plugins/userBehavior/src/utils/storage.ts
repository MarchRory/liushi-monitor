import { UV_RECORD_STORAGE_KEY } from "monitor-sdk/src/configs/constant"
import { getStorage } from "monitor-sdk/src/core/IndicatorStorageCenter"
import { IUVStorage } from "../types/uv"
import { isSameDay } from "monitor-sdk/src/utils/time"

export const getUvRecordStorage = (): Set<string> => {
    let uvRecordStorage: string | IUVStorage | null = getStorage(UV_RECORD_STORAGE_KEY)
    if (!uvRecordStorage) return new Set<string>()

    uvRecordStorage = JSON.parse(uvRecordStorage) as IUVStorage
    const { timestamp, uvRecord } = uvRecordStorage
    return isSameDay(timestamp, new Date().getTime()) ? new Set(uvRecord) : new Set<string>()
}