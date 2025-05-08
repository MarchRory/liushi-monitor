import { ErrorEventTypes, IFirstScreenIndicatorData, PerformanceEventTypes, UserBehaviorEventTypes } from '../types'
import { BaseEventTypes, BaseIndicatorTypes, IBaseTransformedData, ICollectedUserInfo, IDeviceInfo } from '../types/base'
import performanceLogTransformer from './performance'
import errorLogTransformer from './error'
import userbehaviorTransformer from './userbehavior'
import { } from '../../../utils/common/time'
import { UN_SIT_NUMBER_VALUE } from 'src/common/constant'

interface ITransformedLog {
    url: string,
    timestamp: Date,
    eventTypeName: BaseEventTypes,
    eventTypeId?: number
    indicatorId?: number
    indicatorName: BaseIndicatorTypes
    userInfo: ICollectedUserInfo
    deviceInfo: IDeviceInfo<'allow'>
}

export type TransformedLogData = (ITransformedLog & { collectedData: ReturnType<typeof performanceLogTransformer | typeof errorLogTransformer> })

export function logTransformer(originLogs: IBaseTransformedData[]): TransformedLogData[] {
    const transformedData: TransformedLogData[] = []
    for (const originLog of originLogs) {
        const { eventTypeName, indicatorName, deviceInfo, userInfo } = originLog
        const { data = {}, url, timestamp } = originLog.collectedData
        // @ts-ignore
        if (userInfo && (typeof userInfo === 'string' || !userInfo.userId)) {
            originLog['userInfo'] = {
                userId: UN_SIT_NUMBER_VALUE,
                sex: UN_SIT_NUMBER_VALUE,
            }
        } else if (typeof userInfo === 'object' && 'userId' in userInfo && typeof userInfo['userId'] === 'string') {
            userInfo['userId'] = +userInfo['userId']
        }

        if (deviceInfo && typeof deviceInfo === 'string') {
            originLog['deviceInfo'] = {
                deviceBowserName: '',
                deviceBowserVersion: '',
                deviceBowserLanguage: '',
                deviceOs: "Unknown",
                deviceType: "Unknown",
            }
        }

        if (eventTypeName === 'error') {
            const res = errorLogTransformer(indicatorName as ErrorEventTypes, data)
            res.forEach((collectedData) => {
                transformedData.push({
                    ...(originLog as unknown as TransformedLogData),
                    url,
                    timestamp: new Date(timestamp),
                    collectedData
                })
            })
        } else if (eventTypeName === 'performance') {
            if (indicatorName === 'first_screen_indicators') {
                Object.entries(data as IFirstScreenIndicatorData).forEach(([indicator, log]) => {
                    transformedData.push({
                        ...(originLog as unknown as TransformedLogData),
                        indicatorName: indicator as PerformanceEventTypes,
                        url: log.url,
                        timestamp: new Date(log.timestamp),
                        collectedData: performanceLogTransformer(indicator as PerformanceEventTypes, log)
                    })
                })
            } else {
                transformedData.push({
                    ...(originLog as unknown as TransformedLogData),
                    url,
                    timestamp: new Date(timestamp),
                    collectedData: performanceLogTransformer(indicatorName as PerformanceEventTypes, data)
                })
            }
        } else if (eventTypeName === 'userBehavior') {
            if (['pv', 'uv'].includes(indicatorName)) {
                transformedData.push({
                    ...(originLog as unknown as TransformedLogData),
                    collectedData: {
                        url,
                        timestamp: new Date(timestamp).toISOString(),
                    }
                })
            } else {
                const res = userbehaviorTransformer(indicatorName as UserBehaviorEventTypes, data)
                res.forEach((collectedData) => {
                    transformedData.push({
                        ...(originLog as unknown as TransformedLogData),
                        url,
                        timestamp: new Date(timestamp),
                        collectedData
                    })
                })
            }

        }
    }

    return transformedData
}