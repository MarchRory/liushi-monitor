import { SDK_VERSION } from "../configs/constant";
import { BaseEventTypes, IBaseBreadCrumbItem, IBaseClient, IBasePlugin, IOriginalData, ISDKInitialOptions, MonitorTypes } from "../types";
import { customFunctionBucket } from "../utils/common";
import { Stack } from "../utils/dataStructure";
import { BaseBreadCrumb } from "./baseBreadCrumb";
import { BaseTransport } from "./baseTransport";
import { Subscribe } from "./subscribe";

export abstract class BaseClient<E extends MonitorTypes = MonitorTypes> implements IBaseClient {
    readonly sdk_version = SDK_VERSION
    readonly options: ISDKInitialOptions
    /**
     * 页面访问路径栈
     */
    private breadCrumbs: BaseBreadCrumb
    private baseTransport: BaseTransport
    constructor(initialOptions: ISDKInitialOptions) {
        this.options = initialOptions
        this.loadCustomBucket(initialOptions)
        this.breadCrumbs = new BaseBreadCrumb(initialOptions.customBreadCrumb)
        this.baseTransport = new BaseTransport(initialOptions)
    }
    /**
     * 注册插件
     * @param plugins 插件列表
     * @returns 
     */
    use(plugins: IBasePlugin<E>[]) {
        if (this.options.disbled) return

        const eventBus = new Subscribe<BaseEventTypes<E>>()
        plugins.forEach((plugin) => {
            if (plugin.isPluginEnabled) return
            // 开启插件的监控
            plugin.monitor.call(this, this, eventBus.notify.bind(eventBus))
            const monitorCallback = this.reportProcessWapper(plugin)
            eventBus.subscribe(plugin.eventName, monitorCallback)
        })
    }
    /**
     * 依次执行数据处理、hooks、上报等逻辑
     * @param currentPlugin 
     * @returns 
     */
    reportProcessWapper(currentPlugin: IBasePlugin<E>) {
        return async (originalData: IOriginalData) => {
            let customCollectedData: IOriginalData = originalData
            if (this.options.onDataCollected) {
                customCollectedData = await this.options.onDataCollected?.call(this, currentPlugin.eventName, originalData)
            }

            // 格式化收集到的数据
            let transformedData = currentPlugin.dataTransformer?.call(this, this, customCollectedData)
            if (this.options.onDataTransformed) {
                transformedData = await this.options.onDataTransformed?.call(this, currentPlugin.eventName, transformedData)
            }

            // 附加数据添加、上报操作
            currentPlugin.dataConsumer?.call(this, this, transformedData)
        }
    }
    loadCustomBucket(options: ISDKInitialOptions) {
        if (options.dataEncryptionMethod) {
            customFunctionBucket.set('dataEncryptionMethod', options.dataEncryptionMethod)
        }
        customFunctionBucket.set('getUserInfo', options.getUserInfo)
    }
    /**
     * 手动上报方法
     * @param logData 最终加密后的待上报数据
     */
    abstract customLog(logData: any): void
}                 