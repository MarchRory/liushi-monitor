import { App } from "vue";
import { SDK_VERSION } from "../configs/constant";
import { GlobalSubscribeTypes, IBaseClient, IBasePlugin, IBaseTransformedData, IOriginalData, ISDKInitialOptions, MonitorTypes } from "../types";
import { customFunctionBucket, debounce, getCustomFunction, throttle } from "../utils/common";
import { isUndefined } from "../utils/is";
import { StorageCenter } from "./IndicatorStorageCenter";
import { BaseTransport } from "./baseTransport";
import { Subscribe } from "./subscribe";
import { detectDevice } from "../utils/device";
import FmpCalculator from "../plugins/performance/src/utils/FmpCalculator";
import { aop } from "../utils/aop";

export class BaseClient<E extends MonitorTypes = MonitorTypes> implements IBaseClient {
    readonly sdk_version = SDK_VERSION
    readonly options: ISDKInitialOptions
    /**
     * 缓存中心
     */
    readonly storageCenter: StorageCenter
    readonly eventBus: Subscribe<GlobalSubscribeTypes<E>>
    /**
     * 数据调度与上报工具
     */
    readonly baseTransport: BaseTransport
    readonly deviceInfo: IBaseTransformedData['deviceInfo']
    readonly fmpCalculator: FmpCalculator
    readonly VueApp?: App
    readonly pagePerformanceMonitorRecord: Set<string> = new Set()
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
        this.eventBus = new Subscribe<GlobalSubscribeTypes<E>>()
        this.baseTransport = new BaseTransport({
            ...initialOptions,
            storageCenter: this.storageCenter,
            globalEventBus: this.eventBus,
            onBeforeAjaxSend: initialOptions.hooks?.onBeforeAjaxSend
        })
        this.fmpCalculator = new FmpCalculator(initialOptions)
        this.deviceInfo = this.getDeviceInfo()

        aop(window.history, 'pushState', (nativeFn: History['pushState']) => this.globalPushAndReplaceAOP(nativeFn, this.eventBus))
        aop(window.history, 'replaceState', (nativeFn: History['replaceState']) => this.globalPushAndReplaceAOP(nativeFn, this.eventBus))
        aop(window, 'onpopstate', (nativeFn: Window['onpopstate']) => this.globalPopStateAOP(nativeFn, this.eventBus))
        aop(window, 'onpagehide', (nativeFn: Window['onpagehide']) => this.globalPageHideAOP(nativeFn, this.eventBus))
        aop(window, 'onpageshow', (nativeFn: Window['onpageshow']) => this.globalPageShowAOP(nativeFn, this.eventBus))
        aop(window, 'onbeforeunload', (nativeFn: Window['onbeforeunload']) => this.globalPageUnloadAOP(nativeFn, this.eventBus))
        aop(document, 'onvisibilitychange', (nativeFn: Document['onvisibilitychange']) => this.globalVisibiityChangeAOP(nativeFn, this.eventBus))
        aop(window, 'onclick', (nativeFn: Window['onclick']) => this.globalClickEventAOP(nativeFn, this.eventBus))
    }
    /**
     * 注册插件
     * @param plugins 插件列表
     * @returns 
     */
    use(plugins: IBasePlugin<E>[]) {
        if (this.options.disbled) return

        plugins.forEach((plugin) => {
            if (plugin.isPluginEnabled) return
            // 开启插件的监控
            this.pluginsCount++
            plugin.monitor.call(this, this, this.eventBus.notify.bind(this.eventBus))
            const monitorCallback = this.reportProcessWapper(plugin)
            this.eventBus.subscribe(plugin.eventName, monitorCallback)
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
    // TODO: 毕业论文搞完后 使用配置项优化以下编码
    private globalPushAndReplaceAOP(nativeFn: History['pushState'] | History['replaceState'], eventBus: typeof this.eventBus) {
        return function (this: History, ...args: Parameters<typeof nativeFn>) {
            Promise.resolve().then(throttle(() => eventBus.notify('onPushAndReplaceState', args)))
            return nativeFn.apply(this, args)
        }
    }
    private globalPopStateAOP(nativeFn: Window['onpopstate'], eventBus: typeof this.eventBus) {
        return function (this: WindowEventHandlers, args: typeof nativeFn extends null ? any[] : PopStateEvent) {
            Promise.resolve().then(debounce(() => eventBus.notify('onPopState', args), 100))
            if (nativeFn) {
                return nativeFn.apply(this, [args])
            }
        }
    }
    private globalPageHideAOP(nativeFn: Window['onpagehide'], eventBus: typeof this.eventBus) {
        return function (this: WindowEventHandlers, args: PageTransitionEvent) {
            Promise.resolve().then(throttle(() => eventBus.notify('onPageHide', args)))
            if (nativeFn) {
                return nativeFn.apply(this, [args])
            }
        }
    }
    private globalPageShowAOP(nativeFn: Window['onpageshow'], eventBus: typeof this.eventBus) {
        return function (this: WindowEventHandlers, args: PageTransitionEvent) {
            setTimeout(debounce(() => eventBus.notify('onPageShow', args), 100))
            if (nativeFn) {
                return nativeFn.apply(this, [args])
            }
        }
    }
    private globalPageUnloadAOP(nativeFn: Window['onbeforeunload'], eventBus: typeof this.eventBus) {
        return function (this: WindowEventHandlers, args: BeforeUnloadEvent) {
            Promise.resolve().then(() => eventBus.notify('onBeforePageUnload', args))

            if (nativeFn) {
                return nativeFn.apply(this, [args])
            }
        }
    }
    private globalVisibiityChangeAOP(nativeFn: Document['onvisibilitychange'], eventBus: typeof this.eventBus) {
        return function (this: Document, args: Event) {
            if (this.visibilityState === 'hidden') {
                throttle(() => eventBus.notify('onVisibilityToBeHidden', args))
            }
            if (nativeFn) {
                return nativeFn.apply(this, [args])
            }
        }
    }
    private globalClickEventAOP(nativeFn: Window['onclick'], eventBus: typeof this.eventBus) {
        return function (this: GlobalEventHandlers, args: MouseEvent) {
            setTimeout(() => eventBus.notify('click', args))

            if (nativeFn) {
                return nativeFn.apply(this, [args])
            }
        }
    }
}