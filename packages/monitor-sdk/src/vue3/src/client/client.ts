import { ISDKInitialOptions, RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { Vue3BreadCrumbClient } from "./Vue3BreadCrumbClient";
import { App } from "vue";
import { BaseClient } from "../../../core";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { getCustomFunction } from "monitor-sdk/src/utils/common";
import { isUndefined } from "monitor-sdk/src/utils/is";

class Vue3AppMonitorClient extends BaseClient {
    private readonly Vue3BreadCrumb: Vue3BreadCrumbClient
    private readonly spaPagePerformanceRecord = { beforeSpaChange: 0 }
    constructor(initialOptions: ISDKInitialOptions & { VueApp?: App }) {
        super(initialOptions)
        this.Vue3BreadCrumb = new Vue3BreadCrumbClient({
            baseTransport: this.baseTransport,
            storageCenter: this.storageCenter,
            eventBus: this.eventBus,
            options: initialOptions.customBreadCrumb
        })
        this.Vue3BreadCrumb.init()
    }
    /**
     * 放置于路由前置守卫中, 开始记录路由切换时的起始时间
     * @param path 目标路由path
     * @returns void
     */
    spaStartLoadTimiing(path: string) {
        if (this.pagePerformanceMonitorRecord.has(path)) return
        this.pagePerformanceMonitorRecord.add(path)
        const { spaPerformanceConfig = {} } = this.options
        if (!isUndefined(spaPerformanceConfig?.ignoredPageUrls) && spaPerformanceConfig.ignoredPageUrls.includes(path)) return
        this.spaPagePerformanceRecord.beforeSpaChange = performance.now()
    }
    /**
     * 放置于OnMounted钩子或者其他可以认定页面load完成的位置, 结算路由加载时间并上报
     * @returns void
     */
    async sendSpaLoadPerformance() {
        if (this.spaPagePerformanceRecord.beforeSpaChange === 0) return

        const loadedTime = performance.now()

        let sendData: string | object = {
            url: getCurrentUrl(),
            time: getCurrentTimeStamp(),
            loadTime: (loadedTime - this.spaPagePerformanceRecord.beforeSpaChange).toFixed(2) + 'ms'
        }
        this.spaPagePerformanceRecord.beforeSpaChange = 0

        sendData = JSON.stringify({
            type: 'performance',
            eventName: 'spa_page_load_time',
            deviceInfo: this.deviceInfo,
            userInfo: 'unknown',
            collectedData: sendData
        })
        const encryptor = getCustomFunction('dataEncryptionMethod')
        if (encryptor) {
            sendData = encryptor(sendData)
        }
        const { hooks = {} } = this.options
        if (hooks.onBeforeDataReport) {
            sendData = await hooks.onBeforeDataReport(sendData)
        }
        this.baseTransport.preLoadRequest({
            priority: RequestBundlePriorityEnum.PERFORMANCE,
            sendData,
            customCallback: [{
                handleCustomSuccess(...args) {
                    console.log('SPA页面加载时长上报成功')
                },
            }]
        })
    }
}

export default Vue3AppMonitorClient