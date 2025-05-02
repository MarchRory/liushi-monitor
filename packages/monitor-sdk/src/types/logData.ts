import { BaseEventTypes, IPluginTransportDataBaseInfo, MonitorTypes } from "."

/**
 * 打点一线收集到的原始数据
 */
export interface IOriginalData extends Object {
    [key: string]: any
}

export type IDeviceInfo<T extends 'allow' | "unallow" = 'allow'> = T extends 'allow' ? {
    [key: string]: any
    deviceBowserName: string
    deviceBowserVersion: string
    deviceBowserLanguage: string
    deviceOs: "iOS" | "Android" | "Unknown"
    deviceType: 'Android' | "iPad" | 'iPhone' | "Unknown"
} : "unknown"

/**
 * 经过格式化后的基本数据
 */
export type IBaseTransformedData<T extends MonitorTypes, E extends BaseEventTypes<T>> = {
    [key: string]: any
    eventTypeName: T
    indicatorName: E,
    userInfo: object | string
    deviceInfo: IDeviceInfo<'allow' | 'unallow'>
    collectedData: IPluginTransportDataBaseInfo<E>
}

/**
 * 加密后的数据
 */
export type EncryptedDataType = string