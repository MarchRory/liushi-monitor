import { IBaseTransformedData, ISDKInitialOptions, RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { Vue3BreadCrumbClient } from "./Vue3BreadCrumbClient";
import { BaseClient } from "../../../core";
import { isUndefined } from "monitor-sdk/src/utils/is";
import { getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { App } from "vue";

class Vue3AppMonitorClient extends BaseClient {
    private readonly Vue3BreadCrumb: Vue3BreadCrumbClient
    private readonly spaPagePerformanceRecord = { beforeSpaChange: 0 }
    constructor(initialOptions: ISDKInitialOptions & { VueApp: App }) {
        super(initialOptions)
        this.vueApp = initialOptions.VueApp
        this.Vue3BreadCrumb = new Vue3BreadCrumbClient({
            baseTransport: this.baseTransport,
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
        const sendData: IBaseTransformedData<'performance', 'vue3_spa_page_load_time'> = {
            eventTypeName: 'performance',
            indicatorName: 'vue3_spa_page_load_time',
            deviceInfo: this.deviceInfo,
            userInfo: 'unknown',
            collectedData: {
                ...getUrlTimestamp(),
                data: {
                    value: +((loadedTime - this.spaPagePerformanceRecord.beforeSpaChange).toFixed())
                }
            }
        }
        this.spaPagePerformanceRecord.beforeSpaChange = 0
        const { hooks = {} } = this.options
        if (hooks.onBeforeDataReport) {
            await hooks.onBeforeDataReport()
        }
        this.baseTransport.preLoadRequest({
            priority: RequestBundlePriorityEnum.PERFORMANCE,
            sendData,
        })
    }
}

export default Vue3AppMonitorClient