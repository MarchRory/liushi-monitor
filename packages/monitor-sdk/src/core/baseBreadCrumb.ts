import { DEFAULT_BREADCRUMB_CONFIG, DEFAULT_TEMPORARY_BREADITEM_LIMIT } from '../configs/constant'
import { IBaseBreadCrumbItem, IBaseBreadCrumbOptions, IBaseRouteInfo, IBaseTransformedData } from '../types'
import { RequestBundlePriorityEnum } from '../types/transport'
import { debounce, getUrlTimestamp } from '../utils/common'
import { Stack } from '../utils/dataStructure'
import { isNull, isUndefined } from '../utils/is'
import { formatTimeDifference, getCurrentTimeStamp } from '../utils/time'
import { BaseTransport } from './baseTransport'

/**
 * 基本路由面包屑
 */
export abstract class BaseBreadCrumb {
    private breadStack: Stack<IBaseBreadCrumbItem>
    private ignoredUrls: Set<string>
    private tabbarUrls: Set<string>
    private readonly baseTransport: BaseTransport // 数据传输中心实例的引用
    private readonly temporaryBreadItemLimit = DEFAULT_TEMPORARY_BREADITEM_LIMIT
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
        this.ignoredUrls = new Set(ignore_urls)
        this.tabbarUrls = new Set(tabbar_urls)
        this.initBrowserUnloadListener()
        this.debouncedPushRecord = debounce((...args: Parameters<typeof this.pushRecord>) => this.pushRecord(...args))
        this.debouncedPopRecord = debounce((...args: Parameters<typeof this.popRecord>) => this.popRecord(...args))
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
        const enter_time = getCurrentTimeStamp()

        // 兼容tabbar界面
        // const stack = !lastestRecord ? [from] : [...lastestRecord.stack, from]
        const prePathRecord = lastestRecord ? lastestRecord.stack[lastestRecord.stack.length - 1] : null // 路径栈中, 当前栈顶页面路径
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

        this.pushImmediately(data)
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

        lastestRecord.leave_time = getCurrentTimeStamp()
        const { to } = routeInfo
        // 利用微任务避免时间差计算时间长阻塞业务中的同步代码
        Promise.resolve().then(() => {
            lastestRecord.stack.push(to)
            if (newLastestRecord && newLastestRecord.stack.length) {
                newLastestRecord.stack.push(...lastestRecord.stack.slice(1))
            }
            lastestRecord.page_exposure = lastestRecord.leave_time - lastestRecord.enter_time // formatTimeDifference(lastestRecord.leave_time - lastestRecord.enter_time)
            if (this.sendDataTemporaryPool.length < this.temporaryBreadItemLimit) {
                this.sendDataTemporaryPool.push(lastestRecord)
            }
            if (this.sendDataTemporaryPool.length < this.temporaryBreadItemLimit) return

            // 新数据记录后达到容量, 启动上报
            let sendData: IBaseTransformedData<'userBehavior', 'page_exposure'> = {
                type: 'userBehavior',
                eventName: 'page_exposure',
                userInfo: "unknown",
                deviceInfo: "unknown",
                collectedData: {
                    ...getUrlTimestamp(),
                    data: this.sendDataTemporaryPool.slice()
                }
            }
            this.baseTransport.preLoadRequest({
                sendData,
                priority: RequestBundlePriorityEnum.USERBEHAVIOR,
            })
        })
    }
    clearRecord() {
        this.breadStack.clear()
    }
    /**
     * 推送流程
     * @param data 处理之后的breadCrumbItem
     */
    private pushImmediately(data: IBaseBreadCrumbItem) {
        /**
         *  TODO: maybe 一些其他逻辑
         */
        this.breadStack.push(data)
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
    private bothTabbarPaths(paths: string[]) {
        return paths.every(path => this.tabbarUrls.has(path))
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
                        type: 'userBehavior',
                        eventName: 'page_exposure',
                        userInfo: 'unknown',
                        deviceInfo: "unknown",
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