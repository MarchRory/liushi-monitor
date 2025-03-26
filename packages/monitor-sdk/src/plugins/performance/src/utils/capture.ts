import { Subscribe } from "monitor-sdk/src/core";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";
import { CLSMetricWithAttribution } from "web-vitals/attribution";

export const CLSCapture = (metric: CLSMetricWithAttribution, notify: Subscribe['notify']) => {
    const { value, rating, attribution } = metric

    if (rating !== 'good') {
        const indicatorData: Record<string, any> = {
            value,
            rating,
            timestamp: getCurrentTimeStamp(),
            url: getCurrentUrl(),
            largestShiftTarget: attribution.largestShiftTarget || 'unknown',
            largestShiftTime: attribution.largestShiftTime,
            previousRect: attribution.largestShiftSource?.previousRect,
            currentRect: attribution.largestShiftSource?.currentRect
        }
        notify('cls', indicatorData)
    }
}

/**
 * FMP指标监控上报策略
 * @param fmpTargetTag 被视为meaningful元素的类名标识
 * @param weightTable 权重表
 * @param threshold 阈值分数
 * @param notify 
 */
export const FMPCapture = (
    fmpTargetTag: string,
    weightTable: Record<string, number>,
    threshold: number,
    customObserverConfig: MutationObserverInit,
    notify: Subscribe['notify']
) => {
    let preScore = 0
}