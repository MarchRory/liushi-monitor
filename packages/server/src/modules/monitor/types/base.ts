import { ErrorEventTypes } from './error'
import { PerformanceEventTypes } from './performance'
import { IBaseBreadCrumbItem, UserBehaviorEventTypes } from './userBehavior'

export type BaseEventTypes = "error" | "performance" | "userBehavior"

export type BaseIndicatorTypes<T extends BaseEventTypes = BaseEventTypes> =
    T extends 'performance' ? PerformanceEventTypes
    : T extends 'userBehavior' ? UserBehaviorEventTypes
    : T extends 'error' ? ErrorEventTypes
    : string
/**
 * 不需要额外上报data的监控具体事件
 */
type NotNeedDataEventType = 'pv' | 'uv'

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
 * 插件上报数据格式
 */
export interface IPluginTransportDataBaseInfo<
    E extends BaseIndicatorTypes = BaseIndicatorTypes,
    T extends Record<string, any> = Record<string, any>
> {
    url: string
    timestamp: number
    data: (E extends NotNeedDataEventType
        ? null
        : (
            E extends 'page_exposure'
            ? IBaseBreadCrumbItem[]
            : T
        )
    )
}

export interface IBaseTransformedData<
    T extends BaseEventTypes = BaseEventTypes,
    E extends BaseIndicatorTypes<T> = BaseIndicatorTypes<T>
> {
    [key: string]: any
    type: T
    eventName: E,
    userInfo: object | string
    deviceInfo: IDeviceInfo<'allow' | 'unallow'>
    collectedData: IPluginTransportDataBaseInfo<E>
}