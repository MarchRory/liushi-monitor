import { App } from "vue";
import { SDK_VERSION } from "../configs/constant";
import { BaseEventTypes, IBaseClient, IBasePlugin, IBaseTransformedData, IOriginalData, ISDKInitialOptions, MonitorTypes } from "../types";
import { customFunctionBucket, getCustomFunction } from "../utils/common";
import { isUndefined } from "../utils/is";
import { StorageCenter } from "../utils/storage";
import { BaseBreadCrumb } from "./baseBreadCrumb";
import { BaseTransport } from "./baseTransport";
import { Subscribe } from "./subscribe";
import { detectDevice } from "../utils/device";

export class BaseClient<E extends MonitorTypes = MonitorTypes> implements IBaseClient {
    readonly sdk_version = SDK_VERSION
    readonly options: ISDKInitialOptions
    /**
     * 缓存中心
     */
    readonly storageCenter: StorageCenter
    /**
     * 数据调度与上报工具
     */
    readonly baseTransport: BaseTransport
    readonly deviceInfo: IBaseTransformedData['deviceInfo']
    readonly VueApp?: App
    private pluginsCount: number = 4
    constructor(initialOptions: ISDKInitialOptions & { VueApp?: App }) {
        this.validateOptions(initialOptions)
        this.options = initialOptions
        this.VueApp = initialOptions.VueApp
        this.loadCustomBucket(initialOptions)
        this.storageCenter = new StorageCenter({
            storageKey: initialOptions.localStorageKey,
            getPluginsCount: () => this.pluginsCount
        })
        this.baseTransport = new BaseTransport({
            ...initialOptions,
            storageCenter: this.storageCenter,
            onBeforeAjaxSend: initialOptions.hooks?.onBeforeAjaxSend
        })
        this.deviceInfo = this.getDeviceInfo()
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
            const { hooks = {} } = this.options
            // 数据收集
            if (hooks.onDataCollected) {
                customCollectedData = await hooks.onDataCollected?.call(this, currentPlugin.eventName, originalData)
            }

            // 格式化收集到的数据
            let transformedData = currentPlugin.dataTransformer?.call(this, this, customCollectedData)
            if (hooks.onDataTransformed) {
                transformedData = await hooks.onDataTransformed?.call(this, currentPlugin.eventName, transformedData)
            }

            // 数据加密
            const customEncyptor = getCustomFunction('dataEncryptionMethod')
            let encryptedData = JSON.stringify(transformedData)
            if (customEncyptor) {
                encryptedData = customEncyptor(encryptedData)
            }

            // 数据上报
            if (hooks.onBeforeDataReport) {
                encryptedData = await hooks.onBeforeDataReport(encryptedData)
            }
            currentPlugin.dataConsumer?.call(this, this.baseTransport, encryptedData)
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
    private getDeviceInfo(): IBaseTransformedData['deviceInfo'] {
        const userAgent = navigator.userAgent || navigator.vendor
        const { os, deviceType } = detectDevice(userAgent)
        return {
            os,
            deviceType,
            userAgent,
            bowserVersion: navigator.appVersion,
            bowserName: navigator.appName,
            language: navigator.language
        }
    }
}                 