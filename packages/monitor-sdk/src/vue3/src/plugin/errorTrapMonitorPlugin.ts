import type { ComponentPublicInstance } from "vue";
import { IBasePlugin, RequestBundlePriorityEnum } from "../../../types";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";
import { getCustomFunction } from "monitor-sdk/src/utils/common";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { filterVmCollectedInfo } from "../utils/filter";

/**
 * Vue3 报错监控插件
 */
const Vue3ErrorMonitorPlugin: IBasePlugin<'error'> = {
    type: 'error',
    eventName: 'vue3_framework_error',
    monitor(client, notify) {
        const vueApp = client.VueApp
        if (!vueApp) throw new Error('vue示例获取失败, 无法配置监听')
        if (!vueApp.config) throw new Error("vue.config获取失败, 无法配置监听")

        const vueNativeErrorHandler = vueApp.config.errorHandler
        vueApp.config.errorHandler = function (err: unknown, instance: ComponentPublicInstance | null, info: string) {
            //TODO: 未来可能要完善的上报数据
            const originalData = filterVmCollectedInfo(err, instance, info)
            notify('vue3_framework_error', originalData)
            return vueNativeErrorHandler?.(err, instance, info)
        }
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'

        return {
            type: 'error',
            eventName: 'vue3_framework_error',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, encryptedData) {
        transport.preLoadRequest({
            sendData: encryptedData,
            priority: RequestBundlePriorityEnum.ERROR,
            customCallback: [{
                handleCustomSuccess(...args) {
                    console.log('Vue错误上报成功')
                },
            }]
        })
    },
}

export default Vue3ErrorMonitorPlugin