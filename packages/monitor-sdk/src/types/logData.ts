import { BaseEventTypes, IPluginTransportDataBaseInfo, MonitorTypes } from "."

/**
 * 打点一线收集到的原始数据
 */
export interface IOriginalData extends Object {
    [key: string]: any
}

export type IDeviceInfo<T extends 'allow' | "unallow" = 'allow'> = T extends 'allow' ? {
    [key: string]: any
    bowserName: string
    bowserVersion: string
    language: string
    userAgent: string
    os: "iOS" | "Android" | "Unknown"
    deviceType: 'Android' | "iPad" | 'iPhone' | "Unknown"
} : "unknown"

/**
 * 经过格式化后的基本数据
 */
export type IBaseTransformedData<T extends MonitorTypes, E extends BaseEventTypes<T>> = {
    [key: string]: any
    type: T
    eventName: E,
    userInfo: object | string
    deviceInfo: IDeviceInfo<'allow' | 'unallow'>
    collectedData: IPluginTransportDataBaseInfo<E>
}

/**
 * 加密后的数据
 */
export type EncryptedDataType = string