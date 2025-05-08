import { BaseBreadCrumb, BaseTransport, Subscribe } from "monitor-sdk/src/core";
import { GlobalSubscribeTypes, IBaseBreadCrumbOptions, MonitorTypes, RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { HistoryParams, IHistoryStateValue } from "../types/types";
import { getCustomFunction } from "monitor-sdk/src/utils/common";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";

export class Vue3BreadCrumbClient extends BaseBreadCrumb {
    private readonly eventBus: Subscribe<GlobalSubscribeTypes<MonitorTypes>>
    private tabbarExposureRecord = {
        enter_time: 0,
        page_exposure: 0,
        url: ''
    }
    private isTabbarExposureRecoding = false
    constructor(initialOptions: {
        baseTransport: BaseTransport,
        eventBus: Subscribe<GlobalSubscribeTypes<MonitorTypes>>
        options?: IBaseBreadCrumbOptions,
    }) {
        super(initialOptions)
        this.eventBus = initialOptions.eventBus
        this.init()
    }
    init() {
        // Vue-router底层通过调用history.pushState和history.replaceState实现页面前进和替换，
        // 使用history.popState实现页面的回退
        // 故通过切面编程收集到路径栈信息
        this.eventBus.subscribe('onPushAndReplaceState', (args: HistoryParams) => {
            const [state] = args
            const { current, back } = state
            const targetUrl = current.split('?')[0]
            // 进入tabbar页面
            if (this.bothTabbarPaths([targetUrl])) {
                const tabbarUrl = '#' + targetUrl
                if (this.isTabbarExposureRecoding) {
                    this.reportTabbarExposure()
                }
                this.tabbarExposureRecord = {
                    enter_time: new Date().getTime(),
                    page_exposure: 0,
                    url: tabbarUrl
                }
                this.isTabbarExposureRecoding = true
            }
            current && this.debouncedPushRecord({
                from: current.split('?')[0],
                to: ""
            })

        })
        this.eventBus.subscribe('onPopState', (args: PopStateEvent) => {
            if (args.state) {
                const { current, forward } = args.state as IHistoryStateValue
                const targetUrl = current.split('?')[0]
                if (this.bothTabbarPaths([targetUrl])) {
                    // 深层页面回退到tabbar页面
                    // 记录数据
                    const tabbarUrl = '#' + targetUrl
                    this.isTabbarExposureRecoding = true
                    this.tabbarExposureRecord.enter_time = new Date().getTime()
                    this.tabbarExposureRecord.url = tabbarUrl
                }
                forward && current && this.debouncedPopRecord({
                    from: forward.split('?')[0],
                    to: targetUrl
                })
            }
        })
    }
    /**
     * 上报tabbar页面曝光数据
     * @param tabbarUrl tabbar path
     */
    private reportTabbarExposure() {
        const leave_time = new Date().getTime()
        this.tabbarExposureRecord.page_exposure = leave_time - this.tabbarExposureRecord.enter_time
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        const tabbarUrl = this.tabbarExposureRecord.url
        if (!tabbarUrl || this.tabbarExposureRecord.page_exposure < 500) {
            this.tabbarExposureRecord = {
                enter_time: 0,
                page_exposure: 0,
                url: ''
            }
            this.isTabbarExposureRecoding = false
            return
        }

        this.baseTransport.preLoadRequest({
            priority: RequestBundlePriorityEnum.USERBEHAVIOR,
            sendData: {
                eventTypeName: 'userBehavior',
                indicatorName: 'page_exposure',
                deviceInfo: "unknown",
                userInfo,
                collectedData: {
                    url: tabbarUrl,
                    timestamp: getCurrentTimeStamp(),
                    data: [{ ...this.tabbarExposureRecord, leave_time, stack: [tabbarUrl, tabbarUrl] }]
                }
            }
        })
        this.isTabbarExposureRecoding = false
    }
}