import { DEFAULT_BREADCRUMB_CONFIG } from '../configs/constant'
import { IBaseBreadCrumbItem, IBaseBreadCrumbOptions, IBaseRouteInfo } from '../types'
import { RequestBundlePriorityEnum } from '../types/transport'
import { getCustomFunction } from '../utils/common'
import { Stack } from '../utils/dataStructure'
import { isUndefined } from '../utils/is'
import { StorageCenter } from '../utils/storage'
import { formatTimeDifference, getCurrentTimeStamp } from '../utils/time'
import { BaseTransport } from './baseTransport'

/**
 * 基本路由面包屑
 */
export abstract class BaseBreadCrumb {
    private stack: Stack<IBaseBreadCrumbItem>
    private ignoredUrls: Set<string>
    private readonly MAX_STACK_SIZE: IBaseBreadCrumbOptions['max_bread_crumbs_stack_size']
    private readonly MAX_ACCESS_PATH_SIZE: IBaseBreadCrumbOptions['max_access_path_size']
    private readonly baseTransport: BaseTransport // 数据传输中心实例的引用
    private readonly storageCenter: StorageCenter
    constructor({ baseTransport, options, storageCenter }: {
        baseTransport: BaseTransport,
        storageCenter: StorageCenter,
        options?: IBaseBreadCrumbOptions,
    }) {
        this.baseTransport = baseTransport
        this.stack = new Stack()
        const {
            ignore_urls = DEFAULT_BREADCRUMB_CONFIG.ignore_urls,
            max_bread_crumbs_stack_size = DEFAULT_BREADCRUMB_CONFIG.max_bread_crumbs_stack_size,
            max_access_path_size = DEFAULT_BREADCRUMB_CONFIG.max_access_path_size
        } = (options || {})
        this.ignoredUrls = new Set(ignore_urls)
        this.MAX_STACK_SIZE = max_bread_crumbs_stack_size
        this.MAX_ACCESS_PATH_SIZE = max_access_path_size
        this.storageCenter = storageCenter
        this.initBrowserUnloadListener()
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

        const stackTop = this.getLastestItem()
        const enter_time = getCurrentTimeStamp()
        const { from } = routeInfo
        // 兼容tabbar界面
        const access_path = !stackTop ? [from] : [...stackTop.access_path, from]
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

        const stackTop = this.getLastestItem()
        if (isUndefined(stackTop)) return

        stackTop.leave_time = getCurrentTimeStamp()
        const { to } = routeInfo
        // 利用微任务避免时间差计算时间长阻塞业务中的同步代码
        Promise.resolve().then(() => {
            stackTop.access_path.push(to)
            stackTop.page_exposure = formatTimeDifference(stackTop.leave_time - stackTop.enter_time)
            const encryptor = getCustomFunction('dataEncryptionMethod')
            let sendData = JSON.stringify(stackTop)
            if (encryptor) {
                sendData = encryptor(sendData)
            }
            console.log('当前待发送面包屑: ', sendData)
            this.baseTransport.preLoadRequest({
                sendData,
                priority: RequestBundlePriorityEnum.USERBEHAVIOR,
                customCallback: {
                    handleCustomSuccess: () => {
                        console.log('用户行为上报成功, 上报数据: ', stackTop)
                    },
                    handleCustomFailure: () => {
                        console.warn('用户行为上报失败, 上报数据: ', stackTop)
                    }
                }
            })
        })
    }
    clearRecord() {
        this.stack.clear()
    }
    /**
     * 推送流程
     * @param data 处理之后的breadCrumbItem
     */
    private pushImmediately(data: IBaseBreadCrumbItem) {
        /**
         *  TODO: maybe 一些其他逻辑
         */
        console.log('新路径记录: ', data)
        this.stack.push(data)
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
    private getLastestItem() {
        return this.stack.getTop()
    }
    private hasIgnoredPath(paths: string[]) {
        return paths.some(path => this.ignoredUrls.has(path))
    }
    /**
     * 兜底策略, 剩余未上报的部分全部上传至本地缓存, 下一次启动app时再进行发送
     */
    private saveToLocalStorag() {
        const data = this.stack.showAll()
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