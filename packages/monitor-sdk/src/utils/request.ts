import axios, { AxiosInstance } from 'axios'
import { ISDKRequestOption } from '../types'
import { DEFAULT_REQUEST_INIT_OPTIONS } from '../configs/constant'
import { debounce, getCustomFunction } from './common'
import { IProcessingRequestRecord, RequestBundlePriorityEnum } from '../types/axios'



export class HttpRequest {
    private readonly instance: AxiosInstance
    private readonly interfaceUrl: string
    private readonly retryCnt: number
    private readonly singleMaxReportSize: number
    private readonly processingRequests: Promise<void>[] = [] // 维护当前正在处理的请求
    private readonly customHeader: ISDKRequestOption['customHeader']
    private readonly reportDataMap: Map<RequestBundlePriorityEnum, IProcessingRequestRecord[]>
    private readonly requestQueueMaxSize = DEFAULT_REQUEST_INIT_OPTIONS.requestQueueMaxSize
    private readonly PRIORITY_ORDER: RequestBundlePriorityEnum[] = [
        RequestBundlePriorityEnum.ERROR,
        RequestBundlePriorityEnum.PERFORMANCE,
        RequestBundlePriorityEnum.USERBEHAVIOR
    ];
    /**
     * 防抖调度 scheduleRequest 
     */
    private readonly debounceSchedule = debounce(() => this.scheduleRequest());
    constructor(options: ISDKRequestOption) {
        this.retryCnt = options.retryCnt || DEFAULT_REQUEST_INIT_OPTIONS.retryCnt
        this.singleMaxReportSize = options.singleMaxReportSize || DEFAULT_REQUEST_INIT_OPTIONS.singleMaxReportSize
        this.instance = this.initAxios(options.reportbaseURL, options.timeout || DEFAULT_REQUEST_INIT_OPTIONS.timeout)
        this.interfaceUrl = options.reportInterfaceUrl
        this.customHeader = options.customHeader || {}
        this.reportDataMap = new Map([
            [RequestBundlePriorityEnum.ERROR, []],
            [RequestBundlePriorityEnum.PERFORMANCE, []],
            [RequestBundlePriorityEnum.USERBEHAVIOR, []]
        ])
    }
    /**
     * 请求预载, 供各插件完成数据处理后调用
     * 唯一对外暴露方法
     * @param sendData 加密后的上报数据
     * @param priority 上报数据优先级
     */
    preLoadRequest(sendData: string, priority: RequestBundlePriorityEnum) {
        this.reportDataMap.get(priority)?.push({ priority, data: [sendData], retryRecord: 0 });
        this.debounceSchedule()
    }
    /**
     * 请求调度, 核心上报逻辑
     */
    private async scheduleRequest(): Promise<void> {
        if (this.processingRequests.length > 0) return; // 防止重复启动

        while (true) {
            // 控制最多同时 2 个请求
            while (this.processingRequests.length < this.requestQueueMaxSize) {
                const nextData = this.getNextData();
                if (!nextData) break; // 没有新数据可发送了

                const requestPromise = this.sendWithRetry(nextData)
                this.processingRequests.push(requestPromise);
            }

            if (this.processingRequests.length === 0) break; // 没有任务可执行，退出

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
            retryRecord: 0
        }
        for (const priority of this.PRIORITY_ORDER) {
            const queue = this.reportDataMap.get(priority)
            bundleData.priority = priority
            while (queue && queue.length && bundleData.data.length < this.singleMaxReportSize) {
                bundleData.data.push(...(queue.shift()!.data))
            }
            if (bundleData.data.length) {
                return bundleData
            }
        }
        return null
    }
    private async sendToServer(data: IProcessingRequestRecord['data']) {
        return new Promise((resolve, reject) => {
            this.instance.post(this.interfaceUrl, data)
                .then(() => resolve(undefined))
                .catch(reject)
        })
    }

    private async sendWithRetry(params: IProcessingRequestRecord): Promise<void> {
        try {
            await this.sendToServer(params.data);
            this.handleRequestSuccess(params)
        } catch (error) {
            // 失败处理逻辑
            // 请求失败则将当前数据移动到最后, 且retry计数器++
            this.handleRequestFailed(params)
        }
    }
    /**
     * 上报成功回调
     * @param params 
     */
    private handleRequestSuccess(params: IProcessingRequestRecord) {
        const index = this.reportDataMap.get(params.priority)?.findIndex((v) => v.data === params.data);
        if (typeof index !== 'undefined' && index > -1) {
            // 移除元素
            this.reportDataMap.get(params.priority)?.splice(index, 1);
        }
    }
    /**
     * 上报失败回调
     * @param params 
     */
    private handleRequestFailed(params: IProcessingRequestRecord) {
        params.retryRecord++
        const index = this.reportDataMap.get(params.priority)?.findIndex((v) => v.data === params.data);
        if (typeof index !== 'undefined' && index > -1) {
            // 失败时先移除元素
            this.reportDataMap.get(params.priority)?.splice(index, 1);
        }
        if (params.retryRecord <= this.retryCnt) {
            // 需要重试则加入尾部等待下一次发送
            this.reportDataMap.get(params.priority)?.push(params)
        }
        // TODO: 暂定 超过重试次数时直接舍弃, 更可靠的逻辑需要补充
    }
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
                return config
            },
            () => {
                // 先
                // 调用错误捕获器进行捕获
                const getUserInfo = getCustomFunction('getUserInfo')
                if (getUserInfo) {
                    // TODO: 根据error的数据, 构建transformed错误数据, 并计入reportDataMap
                }
            }
        )
        return instance
    }
}