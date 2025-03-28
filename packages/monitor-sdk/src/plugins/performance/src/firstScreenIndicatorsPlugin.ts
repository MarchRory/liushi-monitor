import {
    onCLS,
    onFCP,
    onLCP,
    onTTFB,
    onINP,
    LCPAttribution,
    FCPAttribution,
    TTFBAttribution,
    INPAttribution,
} from 'web-vitals/attribution'
import { IBasePlugin, RequestBundlePriorityEnum, performanceEventMap } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from 'monitor-sdk/src/utils/common';
import { getCurrentTimeStamp } from 'monitor-sdk/src/utils/time';
import { getCurrentUrl } from 'monitor-sdk/src/utils/url';
import { MetricParam, OnWebVitalsType } from './types/web';
import { isUndefined } from 'monitor-sdk/src/utils/is';
import { CLSCapture } from './utils/capture';
/**
 * 阅读下面的文档以了解关于web性能指标的更多内容
 * @see https://web.dev/articles/vitals?hl=zh-cn
 */
export const FirstScreenPerformanceInficatorsPlugin: IBasePlugin<'performance'> = {
    type: 'performance',
    eventName: 'first_screen_indicators',
    monitor(client, notify) {
        const firstScreenIndicatorsTotal = Object.keys(performanceEventMap.first_screen_indicators).length
        let hasRecordIndicatorsCnt = 0
        const originalData: Record<keyof typeof performanceEventMap['first_screen_indicators'], object> = {
            'first_screen_fcp': {},
            'first_screen_fp': {},
            'first_screen_lcp': {},
            'first_screen_ttfb': {}
        }

        // 计算首屏fp
        let paintObserver: PerformanceObserver | null = new PerformanceObserver((entryList) => {
            entryList.getEntries().forEach((entry) => {
                if (entry.name === 'first-paint') {
                    originalData['first_screen_fp'] = {
                        timestamp: getCurrentTimeStamp(),
                        url: getCurrentUrl(),
                        indicatorData: {
                            value: entry.startTime
                        }
                    }
                    notifyHandler()
                }
            });
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // 触发数据上报流程
        function notifyHandler(inpData?: object) {
            if (isUndefined(inpData)) {
                hasRecordIndicatorsCnt++
                if (hasRecordIndicatorsCnt === firstScreenIndicatorsTotal) {
                    notify('first_screen_indicators', {
                        ...getUrlTimestamp(),
                        data: {
                            ...originalData
                        }
                    })
                    client.pagePerformanceMonitorRecord.add(getCurrentUrl())
                    paintObserver?.disconnect()
                }
            } else {
                notify('inp', {
                    ...getUrlTimestamp(),
                    data: { ...inpData }
                })
            }
        }

        // 首屏lcp、fcp、ttfb、inp监控策略
        function commonIndicatorCapture<T extends OnWebVitalsType>(
            type: T,
            metric: MetricParam<T>,
        ) {
            setTimeout(() => {
                const { attribution, value, rating, name } = metric
                let isReportINP = false

                const indicatorName = `first_screen_${name.toLowerCase()}` as keyof typeof performanceEventMap['first_screen_indicators']
                let collectData: Record<string, any> = {
                    timestamp: getCurrentTimeStamp(),
                    url: ('navigationEntry' in attribution) ? (attribution.navigationEntry?.name || getCurrentUrl()) : getCurrentUrl(),
                }
                let indicatorData: Record<string, any> = {
                    value,
                    rating,
                }
                switch (type) {
                    case 'FCP':
                        indicatorData['timeToFirstByte'] = (attribution as FCPAttribution).timeToFirstByte
                        indicatorData['firstByteToFCP'] = (attribution as FCPAttribution).firstByteToFCP
                        break;
                    case 'TTFB':
                        delete (attribution as TTFBAttribution).navigationEntry
                        indicatorData = {
                            value: value,
                            ...(attribution as TTFBAttribution)
                        }
                        break;
                    case 'LCP':
                        indicatorData['element'] = (attribution as LCPAttribution).element || 'unknown'
                        indicatorData['lcpResourceUrl'] = (attribution as LCPAttribution).lcpEntry?.name || ""
                        indicatorData['lcpResourceSize'] = (attribution as LCPAttribution).lcpEntry?.size || 0
                        indicatorData['timeToFirstByte'] = (attribution as LCPAttribution).timeToFirstByte
                        indicatorData['elementRenderDelay'] = (attribution as LCPAttribution).elementRenderDelay
                        break;
                    case 'INP':
                        if (rating === 'poor') {
                            isReportINP = true
                            const { interactionTarget, interactionType, inputDelay } = attribution as INPAttribution
                            indicatorData = {
                                ...indicatorData,
                                interactionTarget,
                                interactionType,
                                inputDelay
                            }
                        }
                        break;
                    default:
                        break;
                }

                if (type !== 'INP') {
                    collectData['indicatorData'] = indicatorData
                    originalData[indicatorName] = collectData
                    notifyHandler()
                } else if (isReportINP) {
                    notifyHandler(indicatorData)
                }
            })
        }

        onLCP((metric) => commonIndicatorCapture('LCP', metric))
        onFCP((metric) => commonIndicatorCapture('FCP', metric))
        onTTFB((metric) => commonIndicatorCapture('TTFB', metric))
        onINP((metric) => commonIndicatorCapture('INP', metric), { reportAllChanges: true })
        onCLS((metric) => CLSCapture(metric, notify))
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'

        return {
            type: 'performance',
            eventName: 'first_screen_indicators',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, encryptedData) {
        transport.preLoadRequest({
            sendData: encryptedData,
            priority: RequestBundlePriorityEnum.PERFORMANCE,
            customCallback: [{
                handleCustomSuccess(...args) {
                    console.log('首屏性能指标上报成功')
                },
            }]
        })
    },
}