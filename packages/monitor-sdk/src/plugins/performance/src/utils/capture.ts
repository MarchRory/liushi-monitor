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