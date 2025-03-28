import { BaseEventTypes, IPluginTransportDataBaseInfo, MonitorTypes } from "."

/**
 * 打点一线收集到的原始数据
 */
export interface IOriginalData extends Object {
    [key: string]: any
}

/**
 * 经过格式化后的基本数据
 */
export interface IBaseTransformedData<T extends MonitorTypes = MonitorTypes, E extends BaseEventTypes<T> = BaseEventTypes<T>> {
    [key: string]: any
    type: T
    eventName: E,
    userInfo: object | string
    deviceInfo: {
        [key: string]: any
        bowserName: string
        bowserVersion: string
        language: string
        userAgent: string
        os: "iOS" | "Android" | "Unknown"
        deviceType: 'Android' | "iPad" | 'iPhone' | "Unknown"
    }
    collectedData: IPluginTransportDataBaseInfo
}

/**
 * 加密后的数据
 */
export type EncryptedDataType = string