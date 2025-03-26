import { IBasePlugin, RequestBundlePriorityEnum, performanceEventMap } from "monitor-sdk/src/types";
import { debounce, getCustomFunction } from "monitor-sdk/src/utils/common";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";

export const SPAPagePerformanceIndicatorsPlugin: IBasePlugin<'performance'> = {
    type: 'performance',
    eventName: 'page_performance_indicators',
    monitor(client, notify) {
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        const transformedData = {
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
            time: getCurrentTimeStamp(),
            url: getCurrentUrl()
        }

        console.log("🚀 ~ dataTransformer ~ transformedData:", transformedData);

        return transformedData
    },
    dataConsumer(transport, encryptedData) {
        transport.preLoadRequest({
            priority: RequestBundlePriorityEnum.PERFORMANCE,
            sendData: encryptedData,
            customCallback: [{
                handleCustomSuccess(...args) {
                    console.log('SPA页面性能埋点上报成功')
                },
            }]
        })
    },
}