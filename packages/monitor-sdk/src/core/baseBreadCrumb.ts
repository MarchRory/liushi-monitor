import { DEFAULT_BREADCRUMB_CONFIG } from '../configs/constant'
import { IBaseBreadCrumbItem, IBaseBreadCrumbOptions, IBaseRouteInfo } from '../types'
import { RequestBundlePriorityEnum } from '../types/transport'
import { debounce, getCustomFunction } from '../utils/common'
import { Stack } from '../utils/dataStructure'
import { isNull, isUndefined } from '../utils/is'
import { StorageCenter } from '../utils/storage'
import { formatTimeDifference, getCurrentTimeStamp } from '../utils/time'
import { BaseTransport } from './baseTransport'

/**
 * 基本路由面包屑
 */
export abstract class BaseBreadCrumb {
    private breadStack: Stack<IBaseBreadCrumbItem>
    private ignoredUrls: Set<string>
    private tabbarUrls: Set<string>
    private readonly MAX_STACK_SIZE: IBaseBreadCrumbOptions['max_bread_crumbs_stack_size']
    private readonly MAX_ACCESS_PATH_SIZE: IBaseBreadCrumbOptions['max_access_path_size']
    private readonly baseTransport: BaseTransport // 数据传输中心实例的引用
    private readonly storageCenter: StorageCenter
    readonly debouncedPushRecord
    readonly debouncedPopRecord
    constructor({ baseTransport, options, storageCenter }: {
        baseTransport: BaseTransport,
        storageCenter: StorageCenter,
        options?: IBaseBreadCrumbOptions,
    }) {
        this.baseTransport = baseTransport
        this.breadStack = new Stack()
        const {
            tabbar_urls,
            ignore_urls = DEFAULT_BREADCRUMB_CONFIG.ignore_urls,
            max_bread_crumbs_stack_size = DEFAULT_BREADCRUMB_CONFIG.max_bread_crumbs_stack_size,
            max_access_path_size = DEFAULT_BREADCRUMB_CONFIG.max_access_path_size
        } = (options || {})
        this.ignoredUrls = new Set(ignore_urls)
        this.tabbarUrls = new Set(tabbar_urls)
        this.MAX_STACK_SIZE = max_bread_crumbs_stack_size
        this.MAX_ACCESS_PATH_SIZE = max_access_path_size
        this.storageCenter = storageCenter
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
        // const access_path = !lastestRecord ? [from] : [...lastestRecord.access_path, from]
        const prePathRecord = lastestRecord ? lastestRecord.access_path[lastestRecord.access_path.length - 1] : null // 路径栈中, 当前栈顶页面路径
        let access_path: string[] = []
        if (isNull(prePathRecord) || this.bothTabbarPaths([prePathRecord, from])) {
            access_path = [from]
        } else {
            access_path = [prePathRecord, from]
        }

        const data: IBaseBreadCrumbItem = {
            url: from,
            enter_time,
            leave_time: -1, // 未退出页面标记
            page_exposure: '0', // 初始化
            access_path
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
            lastestRecord.access_path.push(to)
            if (newLastestRecord && newLastestRecord.access_path.length) {
                newLastestRecord.access_path.push(...lastestRecord.access_path.slice(1))
            }
            lastestRecord.page_exposure = formatTimeDifference(lastestRecord.leave_time - lastestRecord.enter_time)
            const encryptor = getCustomFunction('dataEncryptionMethod')
            let sendData = JSON.stringify(lastestRecord)
            if (encryptor) {
                sendData = encryptor(sendData)
            }

            this.baseTransport.preLoadRequest({
                sendData,
                priority: RequestBundlePriorityEnum.USERBEHAVIOR,
                customCallback: [{
                    handleCustomSuccess: () => {
                        console.log('用户行为上报成功, 上报数据: ', lastestRecord)
                    },
                    handleCustomFailure: () => {
                        console.warn('用户行为上报失败, 上报数据: ', lastestRecord)
                    }
                }]
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
        const unloadHandler = () => {
            this.saveToLocalStorag()
        }
        window.addEventListener('beforeunload', unloadHandler, { capture: true })
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
    private saveToLocalStorag() {
        const data = this.breadStack.showAll()
        const encryptor = getCustomFunction('dataEncryptionMethod')
        let encryptedData: string = JSON.stringify(data)
        if (encryptor) {
            encryptedData = encryptor(encryptedData)
        }
        const stoarge = this.storageCenter.getSpecificStorage('userBehavior')
        stoarge.push(encryptedData)

        this.storageCenter.dispatchStorageOrder({
            type: "update",
            category: 'userBehavior',
            data: stoarge
        })
    }
}