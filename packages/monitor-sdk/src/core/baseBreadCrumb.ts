import { DEFAULT_BREADCRUMB_CONFIG, DEFAULT_TEMPORARY_BREADITEM_LIMIT } from '../configs/constant'
import {
    IBaseBreadCrumbItem,
    IBaseBreadCrumbOptions,
    IBaseRouteInfo,
    IBaseTransformedData,
    IDeviceInfo
} from '../types'
import { RequestBundlePriorityEnum } from '../types/transport'
import { debounce, getCustomFunction, getUrlTimestamp } from '../utils/common'
import { Stack } from '../utils/dataStructure'
import { detectDevice } from '../utils/device'
import { isNull, isUndefined } from '../utils/is'
import { BaseTransport } from './baseTransport'

/**
 * 基本路由面包屑
 */
export abstract class BaseBreadCrumb {
    private breadStack: Stack<IBaseBreadCrumbItem>
    private ignoredUrls: Set<string>
    private tabbarUrls: Set<string>
    readonly deviceInfo: IDeviceInfo
    readonly baseTransport: BaseTransport // 数据传输中心实例的引用
    private readonly temporaryBreadItemLimit = DEFAULT_TEMPORARY_BREADITEM_LIMIT
    /**
     * 自动上报定时器
     */
    private reportInterval: NodeJS.Timeout
    private isReporting = false
    private readonly sendDataTemporaryPool: IBaseBreadCrumbItem[] = []
    readonly debouncedPushRecord
    readonly debouncedPopRecord
    constructor({ baseTransport, options }: {
        baseTransport: BaseTransport,
        options?: IBaseBreadCrumbOptions,
    }) {
        this.baseTransport = baseTransport
        this.breadStack = new Stack()
        const {
            tabbar_urls,
            ignore_urls = DEFAULT_BREADCRUMB_CONFIG.ignore_urls,

        } = (options || {})
        this.deviceInfo = this.getDeviceInfo()
        this.ignoredUrls = new Set(ignore_urls)
        this.tabbarUrls = new Set(tabbar_urls)
        this.initBrowserUnloadListener()
        this.debouncedPushRecord = debounce((...args: Parameters<typeof this.pushRecord>) => this.pushRecord(...args))
        this.debouncedPopRecord = debounce((...args: Parameters<typeof this.popRecord>) => this.popRecord(...args))
        this.reportInterval = setInterval(() => this.reportRecord(), 1000 * 10) // 每45秒自动触发一次上报
    }
    /**
     * 各端实现, 用于配置不同端上的页面路径信息收集逻辑
     */
    abstract init(): void
    /**
     * 进入新页面时, breadBrumbItem数据收集处理流程
     * 由于是强相关于用户行为分析, 登录注册页面就依赖uv和接口统计, 这里边只考虑登录态下的数据收集
     * @param routeInfo 当前路由信息
     */
    pushRecord(routeInfo: IBaseRouteInfo) {
        const isIgnored = this.hasIgnoredPath([routeInfo.from, routeInfo.to])
        if (isIgnored) return
        const { from } = routeInfo

        const lastestRecord = this.readLastestItem()
        const enter_time = performance.now()

        // 兼容tabbar界面
        // 路径栈中, 当前栈顶页面路径
        const prePathRecord = lastestRecord ? lastestRecord.stack[lastestRecord.stack.length - 1] : null
        let stack: string[] = []
        if (isNull(prePathRecord) || this.bothTabbarPaths([prePathRecord, from])) {
            stack = [from]
        } else {
            stack = [prePathRecord, from]
        }

        const data: IBaseBreadCrumbItem = {
            url: from,
            enter_time,
            leave_time: -1, // 未退出页面标记
            page_exposure: 0, // 初始化
            stack
        }
        this.breadStack.push(data)
    }
    /**
     * 退出当前页面时, 数据处理和上报流程
     */
    popRecord(routeInfo: IBaseRouteInfo) {
        const isIgnored = this.hasIgnoredPath([routeInfo.from, routeInfo.to])
        if (isIgnored) return

        const lastestRecord = this.popLastestItem()
        if (isUndefined(lastestRecord)) return
        // 合并当前页面的向后访问路径记录到上一页面的访问栈中
        const newLastestRecord = this.readLastestItem()

        lastestRecord.leave_time = performance.now()
        const { to } = routeInfo
        Promise.resolve().then(() => {
            lastestRecord.stack.push(to)
            if (newLastestRecord && newLastestRecord.stack.length) {
                newLastestRecord.stack.push(...lastestRecord.stack.slice(1))
            }
            lastestRecord.page_exposure = lastestRecord.leave_time - lastestRecord.enter_time
            if (this.sendDataTemporaryPool.length < this.temporaryBreadItemLimit) {
                this.sendDataTemporaryPool.push(lastestRecord)
            }
            if (this.sendDataTemporaryPool.length < this.temporaryBreadItemLimit) return
            // 新数据记录后达到容量, 启动上报
            this.reportRecord()
        })
    }
    /**
     * 路径栈上报
     */
    private reportRecord() {
        if (this.isReporting || this.sendDataTemporaryPool.length === 0) return

        this.isReporting = true
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        let sendData: IBaseTransformedData<'userBehavior', 'page_exposure'> = {
            eventTypeName: 'userBehavior',
            indicatorName: 'page_exposure',
            userInfo,
            deviceInfo: this.deviceInfo,
            collectedData: {
                ...getUrlTimestamp(),
                data: this.sendDataTemporaryPool.slice()
            }
        }
        this.sendDataTemporaryPool.length = 0
        this.baseTransport.preLoadRequest({
            sendData,
            priority: RequestBundlePriorityEnum.USERBEHAVIOR,
        })
        this.isReporting = false

    }
    clearRecord() {
        this.breadStack.clear()
    }
    /**
     * 页面卸载监听器, 补全并消费未上报的内容
     * 这里需要优先使用不受页面卸载影响的sendBean进行发送, 或者使用ajax让页面稍稍延迟卸载
     */
    private initBrowserUnloadListener() {
        window.addEventListener(
            'beforeunload',
            () => this.saveToIndexDB(),
            { capture: true }
        )
    }
    /**
     * 读取最近的记录
     * @returns 
     */
    private popLastestItem() {
        return this.breadStack.pop()
    }
    private readLastestItem() {
        return this.breadStack.getTop()
    }
    private hasIgnoredPath(paths: string[]) {
        return paths.some(path => this.ignoredUrls.has(path))
    }
    bothTabbarPaths(paths: string[]) {
        return paths.every(path => this.tabbarUrls.has(path))
    }
    private getDeviceInfo(): IDeviceInfo {
        const userAgent = navigator.userAgent || navigator.vendor
        const { deviceOs, deviceType } = detectDevice(userAgent)
        return {
            deviceOs,
            deviceType,
            deviceBowserVersion: navigator.appVersion,
            deviceBowserName: navigator.appName,
            deviceBowserLanguage: navigator.language
        }
    }
    /**
     * 兜底策略, 剩余未上报的部分全部上传至本地缓存, 下一次启动app时再进行发送
     */
    private saveToIndexDB() {
        const data = this.breadStack.showAll()
        if (data.length) {
            this.baseTransport.postMessageToWorkerThread({
                type: 'preLoadRequest',
                payload: {
                    priority: RequestBundlePriorityEnum.USERBEHAVIOR,
                    sendData: {
                        eventTypeName: 'userBehavior',
                        indicatorName: 'page_exposure',
                        userInfo: 'unknown',
                        deviceInfo: this.deviceInfo,
                        collectedData: {
                            ...getUrlTimestamp(),
                            data: data.slice()
                        }
                    }
                }
            })
        }
    }
}