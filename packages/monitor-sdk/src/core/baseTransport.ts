import { BaseEventTypes, GlobalSubscribeTypes, ISDKInitialOptions, ISDKRequestOption, MonitorTypes } from '../types'
import { DEFAULT_REQUEST_INIT_OPTIONS } from '../configs/constant'
import { IPreLoadParmas, SendDataTextType } from '../types/transport'
import { throttle } from '../utils/common'
import { Subscribe } from './subscribe'
import { IMainThreadPostToWorkerMesage, MainThreadPostToWorkerEvent, ThreadMessage } from '../worker/types'
import { IEncryptionConfig } from '../types/excryption'
/**
 * 基本数据上报中心
 */
export class BaseTransport {
    /**
     * 用于监听上报请求, 自动触发链式上报
     */
    private readonly globalEventBus: Subscribe<GlobalSubscribeTypes>
    private readonly customReportConfig: Required<ISDKRequestOption>
    readonly throttledPreLoadRequest = throttle((...args: Parameters<typeof this.preLoadRequest>) => this.preLoadRequest(...args))
    private readonly worker: Worker
    constructor(options: {
        reportConfig: ISDKInitialOptions['reportConfig']
        globalEventBus: Subscribe<GlobalSubscribeTypes>
    }) {
        const { reportConfig } = options
        this.customReportConfig = {
            dbName: reportConfig.dbName || "monitor_db",
            reportbaseURL: reportConfig.reportbaseURL,
            reportInterfaceUrl: reportConfig.reportInterfaceUrl,
            debugMode: reportConfig.debugMode || false,
            reportTaskSizeLimit: reportConfig.reportTaskSizeLimit || DEFAULT_REQUEST_INIT_OPTIONS.reportTaskSizeLimit,
            retryCnt: reportConfig.retryCnt || DEFAULT_REQUEST_INIT_OPTIONS.retryCnt,
            transportDelay: reportConfig.transportDelay || DEFAULT_REQUEST_INIT_OPTIONS.transportDelay,
            singleMaxReportSize: reportConfig.singleMaxReportSize || DEFAULT_REQUEST_INIT_OPTIONS.singleMaxReportSize,
            customExtraRequestHeaderInfo: reportConfig.customExtraRequestHeaderInfo || {},
            timeout: reportConfig.timeout || 5 * 1000
        }
        this.globalEventBus = options.globalEventBus
        this.worker = new Worker(new URL('../worker/transport.worker.ts', import.meta.url), { type: 'module' })
        this.onWorkerThreadMessage()
        this.postMessageToWorkerThread({ type: 'init', payload: this.customReportConfig })
        //  this.checkStorageAndReReport()
    }
    /**
     * 向worker线程通信
     * @param order 
     */
    postMessageToWorkerThread<T extends MainThreadPostToWorkerEvent = MainThreadPostToWorkerEvent>(
        order: {
            type: T,
            payload: IMainThreadPostToWorkerMesage[T]
        }
    ) {
        console.log('主线程即将发送数据: ', order)
        this.worker.postMessage(order)
    }
    /**
     * 请求预载, 供各插件完成数据处理后调用
     * @param sendData 加密后的上报数据
     * @param priority 上报数据优先级
     * @param customCallback 
     */
    preLoadRequest<T extends MonitorTypes, E extends BaseEventTypes<T>, S extends SendDataTextType>({
        sendData, priority, textType = 'plaintext'
    }: IPreLoadParmas<T, E, S>
    ) {
        this.postMessageToWorkerThread({
            type: 'preLoadRequest',
            payload: { sendData, priority, textType }
        })
    }
    /**
     * 给用户使用, 传递加密参数
     */
    sendEncryptionConfig(payload: IEncryptionConfig<'unParsed'>) {
        this.postMessageToWorkerThread({
            type: 'sendEncryptionConfig',
            payload
        })
    }
    /**
     * 每次启动时检查本地缓存, 重新发送上一次页面卸载时未发送成功的数据
     */
    // private checkStorageAndReReport() {
    //     const splitArr = (source: string[] = []) => {
    //         const res: string[] = []
    //         while (source.length && source.length < this.customReportConfig.singleMaxReportSize) {
    //             const data = source.shift()
    //             data && res.push(data)
    //         }
    //         return res
    //     }

    //     const run = (source: string[], priority: RequestBundlePriorityEnum) => {
    //         for (let i = 0; i < source.length; i++) {
    //             this.preLoadRequest<MonitorTypes, BaseEventTypes, SendDataTextType>({
    //                 textType: 'ciphertext',
    //                 sendData: source[i],
    //                 priority,
    //             })
    //         }
    //     }
    //     run(behaviorStorage, RequestBundlePriorityEnum.USERBEHAVIOR)
    //     run(performanceStorage, RequestBundlePriorityEnum.PERFORMANCE)
    //     run(errorStorage, RequestBundlePriorityEnum.ERROR)
    // }
    /**
     * 挂载worker通信监听
     */
    private onWorkerThreadMessage() {
        this.worker.onmessage = (ev: MessageEvent<ThreadMessage<'WorkerThread'>>) => {
            const { type, payload } = ev.data
            switch (type) {
                case 'reportAjaxError':
                    this.globalEventBus.notify('uncatch_promise_error', payload)
                    break
                case 'saveBeforeUnload':
                    this.worker.terminate()
                    break
                default:
                    break;
            }
        }
    }
}