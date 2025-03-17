import { SDK_VERSION } from "../configs/constant";
import { BaseEventTypes, IBaseClient, IBasePlugin, IOriginalData, ISDKInitialOptions, MonitorTypes } from "../types";
import { customFunctionBucket } from "../utils/common";
import { isUndefined } from "../utils/is";
import { StorageCenter } from "../utils/storage";
import { BaseBreadCrumb } from "./baseBreadCrumb";
import { BaseTransport } from "./baseTransport";
import { Subscribe } from "./subscribe";

export class BaseClient<E extends MonitorTypes = MonitorTypes> implements IBaseClient {
    readonly sdk_version = SDK_VERSION
    readonly options: ISDKInitialOptions
    /**
     * 页面访问路径栈
     */
    private readonly breadCrumbs: BaseBreadCrumb
    /**
     * 数据调度与上报工具
     */
    private readonly baseTransport: BaseTransport
    /**
     * 缓存中心
     */
    private readonly storageCenter: StorageCenter
    private pluginsCount: number = 4
    constructor(initialOptions: ISDKInitialOptions) {
        this.validateOptions(initialOptions)
        this.options = initialOptions
        this.loadCustomBucket(initialOptions)
        this.storageCenter = new StorageCenter({
            storageKey: initialOptions.localStorageKey,
            getPluginsCount: () => this.pluginsCount
        })
        this.baseTransport = new BaseTransport({
            ...initialOptions,
            storageCenter: this.storageCenter
        })
        this.breadCrumbs = new BaseBreadCrumb({
            baseTransport: this.baseTransport,
            options: initialOptions.customBreadCrumb,
            storageCenter: this.storageCenter
        })
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
            this.pluginsCount++
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
    private loadCustomBucket(options: ISDKInitialOptions) {
        if (options.dataEncryptionMethod) {
            customFunctionBucket.set('dataEncryptionMethod', options.dataEncryptionMethod)
        }
        customFunctionBucket.set('getUserInfo', options.getUserInfo)
    }
    private validateOptions(options: ISDKInitialOptions) {
        let needOptName: keyof ISDKInitialOptions = ''
        if (isUndefined(options.localStorageKey) || !options.localStorageKey) {
            needOptName = 'localStorageKey'
        } else if (isUndefined(options.reportInterfaceUrl) || !options.reportInterfaceUrl) {
            needOptName = 'reportInterfaceUrl'
        } else if (isUndefined(options.getUserInfo) || !options.getUserInfo) {
            needOptName = 'getUserInfo'
        } else if (isUndefined(options.dataEncryptionMethod) || !options.dataEncryptionMethod) {
            needOptName = 'dataEncryptionMethod'
        }

        if (needOptName) {
            throw new Error(`初始配置项 ${needOptName} 缺失 或 使用了非法值`)
        }
    }
}                 