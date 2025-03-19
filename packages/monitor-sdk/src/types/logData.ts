/**
 * 打点一线收集到的原始数据
 */
export interface IOriginalData extends Object {
    [key: string]: any
}

/**
 * 经过格式化后的基本数据
 */
export interface IBaseTransformedData {
    [key: string]: any
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
    url: string
    time: number
    collectedData: IOriginalData
}

/**
 * 加密后的数据
 */
export type EncryptedDataType = string