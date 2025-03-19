import type { ComponentPublicInstance } from "vue";
import { IBasePlugin, RequestBundlePriorityEnum } from "../../../types";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";
import { getCustomFunction } from "monitor-sdk/src/utils/common";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { filterVmCollectedInfo } from "../utils/handler";

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
        vueApp.config.errorHandler = async function (err: unknown, instance: ComponentPublicInstance | null, info: string) {
            console.log('err: ', err, 'instance: ', instance, 'info: ', info)
            //TODO: 收集和上报逻辑

            const originalData = filterVmCollectedInfo(err, instance, info)
            notify('vue3_framework_error', originalData)
            return vueNativeErrorHandler?.(err, instance, info)
        }
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        return {
            userInfo: getUserInfo ? getUserInfo() : "unknown",
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
            time: getCurrentTimeStamp(),
            url: getCurrentUrl()
        }

    },
    dataConsumer(transport, encryptedData) {
        transport.preLoadRequest({
            sendData: encryptedData,
            priority: RequestBundlePriorityEnum.ERROR,
            customCallback: {
                handleCustomSuccess(...args) {
                    console.log('Vue错误上报成功')
                },
            }
        })
    },
}

export default Vue3ErrorMonitorPlugin