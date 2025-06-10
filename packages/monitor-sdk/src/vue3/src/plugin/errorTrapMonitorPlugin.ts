import type { ComponentPublicInstance, App } from "vue";
import { IBasePlugin, RequestBundlePriorityEnum } from "../../../types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { filterVmCollectedInfo } from "../utils/filter";
import { Vue3ErrorTrapTransportData } from "../types/plugin";

/**
 * Vue3 报错监控插件
 */
const Vue3ErrorMonitorPlugin: IBasePlugin<'error', 'vue3_framework_error'> = {
    eventTypeName: 'error',
    indicatorName: 'vue3_framework_error',
    monitor(client, notify) {
        const vueApp = client.vueApp
        if (!vueApp) throw new Error('vue示例获取失败, 无法配置监听')
        if (!vueApp.config) throw new Error("vue.config获取失败, 无法配置监听")

        const vueNativeErrorHandler = vueApp.config.errorHandler
        vueApp.config.errorHandler = function (err: unknown, instance: ComponentPublicInstance | null, info: string) {
            const data = filterVmCollectedInfo(err, instance, info)
            const transportData: Vue3ErrorTrapTransportData = {
                ...getUrlTimestamp(),
                data
            }
            notify('vue3_framework_error', transportData)
            return vueNativeErrorHandler?.(err, instance, info)
        }
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'

        return {
            eventTypeName: 'error',
            indicatorName: 'vue3_framework_error',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, dataTransformed) {
        transport.preLoadRequest({
            sendData: dataTransformed,
            priority: RequestBundlePriorityEnum.ERROR,
        })
    },
}

export default Vue3ErrorMonitorPlugin