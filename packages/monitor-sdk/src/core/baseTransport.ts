import axios, { AxiosInstance } from 'axios'
import { GlobalSubscribeTypes, IMonitorHooks, ISDKRequestOption } from '../types'
import { DEFAULT_LOCALSTORAGE_KEY, DEFAULT_REQUEST_INIT_OPTIONS } from '../configs/constant'
import { IPreLoadParmas, IProcessingRequestRecord, RequestBundlePriorityEnum, TransportTask, TransportTaskRunType } from '../types/transport'
import { getCustomFunction, throttle } from '../utils/common'
import { StorageCenter, setStorage } from './IndicatorStorageCenter'
import { fakeRequest } from '../utils/request'
import { TaskScheduler } from './scheduler'
import { Subscribe } from './subscribe'


/**
 * 基本数据上报中心
 */
export class BaseTransport {
    private readonly instance: AxiosInstance
    /**
     * 接口地址
     */
    private readonly interfaceUrl: string
    /**
     * 单条记录上报重试次数
     */
    private readonly retryCnt: number
    /**
     * 异步任务调度器
     */
    private readonly asyncTaskScheduler: TaskScheduler<TransportTask>
    /**
     * 用于监听上报请求, 自动触发链式上报
     */
    private readonly globalEventBus: Subscribe<GlobalSubscribeTypes>
    /**
     * 自定义请求头内容
     */
    private readonly customHeader: ISDKRequestOption['customHeader']
    /**
     * 待上报的数据
     */
    private readonly reportDataMap: Map<RequestBundlePriorityEnum, IProcessingRequestRecord[]>
    private readonly storageCenter: StorageCenter
    /**
     * 单条上报携带的数据量限制
     */
    private readonly singleMaxReportSize: number
    /**
     * 请求优先级
     */
    private readonly PRIORITY_ORDER: RequestBundlePriorityEnum[] = [
        RequestBundlePriorityEnum.ERROR,
        RequestBundlePriorityEnum.PERFORMANCE,
        RequestBundlePriorityEnum.USERBEHAVIOR
    ];
    private readonly debugMode: boolean
    private delayReportTimer: NodeJS.Timeout | null = null
    private readonly transportDelay: number
    private readonly onBeforeAjaxSend: IMonitorHooks['onBeforeAjaxSend']
    readonly throttledPreLoadRequest = throttle((...args: Parameters<typeof this.preLoadRequest>) => this.preLoadRequest(...args))
    constructor(options: ISDKRequestOption & {
        storageCenter: StorageCenter,
        globalEventBus: Subscribe<GlobalSubscribeTypes>
    } & {
        onBeforeAjaxSend: IMonitorHooks['onBeforeAjaxSend']
    }) {
        this.debugMode = options.debugMode || false
        this.retryCnt = options.retryCnt || DEFAULT_REQUEST_INIT_OPTIONS.retryCnt
        this.transportDelay = options.transportDelay || DEFAULT_REQUEST_INIT_OPTIONS.transportDelay
        this.singleMaxReportSize = options.singleMaxReportSize || DEFAULT_REQUEST_INIT_OPTIONS.singleMaxReportSize
        this.instance = this.initAxios(options.reportbaseURL, options.timeout || DEFAULT_REQUEST_INIT_OPTIONS.timeout)
        this.interfaceUrl = options.reportInterfaceUrl
        this.customHeader = options.customHeader || {}
        this.storageCenter = options.storageCenter
        this.globalEventBus = options.globalEventBus
        this.onBeforeAjaxSend = options.onBeforeAjaxSend
        this.reportDataMap = new Map([
            [RequestBundlePriorityEnum.ERROR, []],
            [RequestBundlePriorityEnum.PERFORMANCE, []],
            [RequestBundlePriorityEnum.USERBEHAVIOR, []]
        ])
        this.asyncTaskScheduler = new TaskScheduler(options.reportTaskSizeLimit || DEFAULT_REQUEST_INIT_OPTIONS.reportTaskSizeLimit)
        this.globalEventBus.subscribe('reportSuccess', () => this.loadNextReportTask())
        this.globalEventBus.subscribe('onBeforePageUnload', () => this.saveRestDataToStoarge())
        this.globalEventBus.subscribe('onPageHide', () => this.saveRestDataToStoarge())
        this.globalEventBus.subscribe('onVisibilityToBeHidden', () => this.saveRestDataToStoarge())
        this.checkStorageAndReReport()
    }
    /**
     * 请求预载, 供各插件完成数据处理后调用
     * 唯一对外暴露方法
     * @param sendData 加密后的上报数据
     * @param priority 上报数据优先级
     * @param customCallback 
     */
    preLoadRequest({ sendData, priority, customCallback }: IPreLoadParmas) {
        this.reportDataMap.get(priority)?.push({ priority, data: Array.isArray(sendData) ? sendData : [sendData], retryRecord: 0, customCallback });


        if (this.delayReportTimer) return
        this.delayReportTimer = setTimeout(() => {
            this.globalEventBus.notify('reportSuccess')
            clearTimeout(this.delayReportTimer as NodeJS.Timeout)
            this.delayReportTimer = null
        }, this.transportDelay)
    }

    /**
     * 按优先级获取下一个待发送数据
     */
    private getNextData(): IProcessingRequestRecord | null {
        let bundleData: IProcessingRequestRecord = {
            data: [],
            priority: RequestBundlePriorityEnum.USERBEHAVIOR,
            retryRecord: 0,
            customCallback: []
        }
        for (const priority of this.PRIORITY_ORDER) {
            const queue = this.reportDataMap.get(priority)
            bundleData.priority = priority
            while (queue && queue.length && bundleData.data.length < this.singleMaxReportSize) {
                const queueHead = queue.shift()
                if (queueHead?.retryRecord) {
                    // 重试数据直接返回
                    return queueHead
                }
                bundleData.data.push(...(queueHead!.data))
                if (queueHead?.customCallback) {
                    bundleData.customCallback?.push(...queueHead.customCallback)
                }
            }
            if (bundleData.data.length) {
                return bundleData
            }
        }
        return null
    }
    /**
     * 
     * @param params 
     * @param type 'report' | 'returnParam' | undefined
     * @returns 
     */
    private async sendWithRetry(
        params: IProcessingRequestRecord,
        type?: TransportTaskRunType) {
        const requestHandler = this.debugMode ? fakeRequest : this.instance.post
        if (type === 'returnParam') return params

        try {
            await requestHandler(this.interfaceUrl, params.data);
            this.globalEventBus.notify('reportSuccess')
            this.handleRequestSuccess(params)
            console.log('\n' + '-'.repeat(30))
            console.log('-'.repeat(30) + "\n")
        } catch {
            this.handleRequestFailed(params)
            // 失败处理逻辑
        } finally {
            return
        }
    }
    /**
     * 上报成功回调
     * @param params 
     */
    private handleRequestSuccess(params: IProcessingRequestRecord) {
        const sendingItem = this.reportDataMap.get(params.priority)
        if (!sendingItem) return
        const { customCallback } = params
        if (customCallback && customCallback.length) {
            customCallback.forEach(({ handleCustomSuccess }) => {
                handleCustomSuccess && handleCustomSuccess()
            })
        }
    }
    /**
     * 上报失败回调
     * @param params 
     */
    private handleRequestFailed(params: IProcessingRequestRecord) {
        params.retryRecord++
        if (params.retryRecord >= this.retryCnt) {
            return
        }
        const { customCallback } = params
        if (customCallback && customCallback.length) {
            customCallback.forEach(({ handleCustomFailure }) => {
                handleCustomFailure && handleCustomFailure()
            })
        }
        if (params.retryRecord < this.retryCnt) {
            // 需要重试则加入尾部等待下一次发送
            this.reportDataMap.get(params.priority)?.push(params)
        }
        // TODO: 暂定 超过重试次数时直接舍弃, 更可靠的逻辑需要补充
    }
    /**
     * 读取下一次发送的数据并添加上报到异步调度器
     * @returns 
     */
    private loadNextReportTask() {
        const nextData = this.getNextData()
        if (!nextData) return
        // TODO: 解决类型冲突
        this.asyncTaskScheduler.addTask(() => (type?: TransportTaskRunType) => this.sendWithRetry(nextData, type))
    }

    /**
     * 初始化axios
     * @param baseURL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
     * @param timeout 
     * @returns 
     */
    private initAxios(baseURL: string, timeout: number): AxiosInstance {
        const instance = axios.create({
            baseURL,
            timeout
        })
        instance.interceptors.request.use(
            (config) => {
                if (Object.keys((this.customHeader || {})).length) {
                    for (let key in this.customHeader) {
                        if (Object.hasOwn(this.customHeader, key)) {
                            config.headers[key] = this.customHeader[key]
                        }
                    }
                }

                // 用户自定义config的最后机会
                if (this.onBeforeAjaxSend) {
                    config = this.onBeforeAjaxSend(config)
                }
                return config
            },
            (error) => {
                // 先
                // 调用错误捕获器进行捕获
                const getUserInfo = getCustomFunction('getUserInfo')
                if (getUserInfo) {
                    // TODO: 待测试 根据error的数据, 构建transformed错误数据, 并计入reportDataMap
                }
            }
        )
        return instance
    }
    /**
     * 每次启动时检查本地缓存, 重新发送上一次页面卸载时未发送成功的数据
     */
    private checkStorageAndReReport() {
        const splitArr = (source: string[][] = []) => {
            const res: string[][] = []
            while (source.length && source.length < this.singleMaxReportSize) {
                const data = source.shift()
                data && res.push(data)
            }
            return res
        }
        const behaviorStorage = splitArr(this.storageCenter.getSpecificStorage(RequestBundlePriorityEnum.USERBEHAVIOR))
        const performanceStorage = splitArr(this.storageCenter.getSpecificStorage(RequestBundlePriorityEnum.PERFORMANCE))
        const errorStorage = splitArr(this.storageCenter.getSpecificStorage(RequestBundlePriorityEnum.ERROR))

        this.storageCenter.dispatchStorageOrder({
            type: 'clearAll'
        })

        const run = (source: string[][], priority: RequestBundlePriorityEnum) => {
            for (let i = 0; i < source.length; i++) {
                this.preLoadRequest({
                    sendData: source[i],
                    priority,
                    customCallback: [{
                        handleCustomSuccess(...args) {
                            console.log('页面关闭前的未上报任务, 重新上报成功')
                        },
                    }]
                })
            }
        }
        run(behaviorStorage, RequestBundlePriorityEnum.USERBEHAVIOR)
        run(performanceStorage, RequestBundlePriorityEnum.PERFORMANCE)
        run(errorStorage, RequestBundlePriorityEnum.ERROR)
    }
    /**
     * 终止发送
     * @returns 
     */
    private saveRestDataToStoarge() {
        const restTasks = this.asyncTaskScheduler.stopScheduleAndReturnRestTasks()
        if (restTasks.length === 0) return
        restTasks.forEach(async (task) => {
            const unSendData = await task()('returnParam')
            if (unSendData) {
                const { data, priority } = unSendData
                this.storageCenter.handleSaveBeforeUnload(priority, data)
            }
        })
    }
}