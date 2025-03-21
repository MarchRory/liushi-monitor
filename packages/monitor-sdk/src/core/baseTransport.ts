import axios, { AxiosInstance } from 'axios'
import { IMonitorHooks, ISDKRequestOption, MonitorTypes } from '../types'
import { DEFAULT_REQUEST_INIT_OPTIONS } from '../configs/constant'
import { IPreLoadParmas, IProcessingRequestRecord, RequestBundlePriorityEnum } from '../types/transport'
import { getCustomFunction } from '../utils/common'
import { StorageCenter } from '../utils/storage'
import { fakeRequest } from '../utils/request'


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
     * 上报中的请求
     */
    private readonly processingRequests: Promise<void>[] = [] // 维护当前正在处理的请求
    /**
     * 自定义请求头内容
     */
    private readonly customHeader: ISDKRequestOption['customHeader']
    /**
     * 待上报的数据
     */
    private readonly reportDataMap: Map<RequestBundlePriorityEnum, IProcessingRequestRecord[]>
    /**
     * 待上报的数据总量
     */
    private waitToReportCnt: number = 0
    /**
     * 请求队列最大限制
     */
    private readonly requestQueueMaxSize = DEFAULT_REQUEST_INIT_OPTIONS.requestQueueMaxSize
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
    private readonly onBeforeAjaxSend: IMonitorHooks['onBeforeAjaxSend']
    constructor(options: ISDKRequestOption & {
        storageCenter: StorageCenter,
    } & {
        onBeforeAjaxSend: IMonitorHooks['onBeforeAjaxSend']
    }) {
        this.debugMode = options.debugMode || false
        this.retryCnt = options.retryCnt || DEFAULT_REQUEST_INIT_OPTIONS.retryCnt
        this.singleMaxReportSize = options.singleMaxReportSize || DEFAULT_REQUEST_INIT_OPTIONS.singleMaxReportSize
        this.instance = this.initAxios(options.reportbaseURL, options.timeout || DEFAULT_REQUEST_INIT_OPTIONS.timeout)
        this.interfaceUrl = options.reportInterfaceUrl
        this.customHeader = options.customHeader || {}
        this.storageCenter = options.storageCenter
        this.onBeforeAjaxSend = options.onBeforeAjaxSend
        this.reportDataMap = new Map([
            [RequestBundlePriorityEnum.ERROR, []],
            [RequestBundlePriorityEnum.PERFORMANCE, []],
            [RequestBundlePriorityEnum.USERBEHAVIOR, []]
        ])
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
        this.waitToReportCnt++
        this.scheduleRequest()
    }
    /**
     * 请求调度, 核心上报逻辑
     */
    private async scheduleRequest(): Promise<void> {
        if (this.processingRequests.length && this.waitToReportCnt) return; // 防止重复启动
        while (this.waitToReportCnt) {
            // 控制上报请求数量, 减轻对业务请求的影响 
            for (let i = 0; this.processingRequests.length < this.requestQueueMaxSize; i++) {
                const nextData = this.getNextData();
                if (!nextData) break; // 没有新数据可发送了

                const requestPromise = this.sendWithRetry(nextData, i)
                this.processingRequests.push(requestPromise);
            }

            // if (this.processingRequests.length === 0) break; // 没有任务可执行，退出
            // 等待最快完成的请求，确保并发执行
            await Promise.race(this.processingRequests);
        }
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

    private sendWithRetry(params: IProcessingRequestRecord, processingIndex: number): Promise<void> {
        const requestHandler = this.debugMode === true ? fakeRequest : this.instance.post
        return new Promise(async (resolve, reject) => {
            try {
                await requestHandler(this.interfaceUrl, params.data);
                this.processingRequests.splice(processingIndex, 1)
                resolve()
                this.handleRequestSuccess(params)
                console.log('waitCnt: ', this.waitToReportCnt)
                console.log('\n' + '-'.repeat(30))
                console.log('-'.repeat(30) + "\n")
            } catch (error) {
                this.processingRequests.splice(processingIndex, 1)
                reject()
                // 失败处理逻辑
                // 请求失败则将当前数据移动到最后, 且retry计数器++
                this.handleRequestFailed(params)
            }
        })
    }
    /**
     * 上报成功回调
     * @param params 
     */
    private handleRequestSuccess(params: IProcessingRequestRecord) {
        this.waitToReportCnt--
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
            this.waitToReportCnt--
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
        const splitArr = (source: string[] = []) => {
            const res: string[][] = []
            while (source.length && source.length < this.singleMaxReportSize) {
                res.push(source.splice(0, 5))
            }
            return res
        }
        const behaviorStorage = splitArr(this.storageCenter.getSpecificStorage('userBehavior'))
        const performanceStorage = splitArr(this.storageCenter.getSpecificStorage('performance'))
        const errorStorage = splitArr(this.storageCenter.getSpecificStorage('error'))

        const run = (source: string[][], priority: RequestBundlePriorityEnum, category: MonitorTypes) => {
            for (let i = 0; i < source.length; i++) {
                this.preLoadRequest({
                    sendData: source[i], priority,
                    // customCallback: {
                    //     handleCustomSuccess: (i) => {
                    //         source.splice(i, 1)
                    //         this.storageCenter.dispatchStorageOrder({
                    //             type: 'update',
                    //             category,
                    //             data: source[i].slice()
                    //         })
                    //     },
                    // }
                })
            }
        }
        run(behaviorStorage, RequestBundlePriorityEnum.USERBEHAVIOR, 'userBehavior')
        run(performanceStorage, RequestBundlePriorityEnum.PERFORMANCE, 'performance')
        run(errorStorage, RequestBundlePriorityEnum.ERROR, 'error')
    }
}