import axios, { AxiosInstance } from 'axios'
import CryptoJS from 'crypto-js';
import { TaskScheduler } from '../core/scheduler'
import {
    BaseEventTypes,
    BaseTransportEventType,
    IPreLoadParmas,
    IProcessingRequestRecord,
    MonitorTypes,
    RequestBundlePriorityEnum,
    SendDataTextType,
    TransportTask,
    TransportTaskRunType
} from '../types'
import { Subscribe } from '../core'
import {
    IWorkerPostToMainThreadMessage,
    ThreadMessage,
    TransportWorkerConfig,
    WorkerConfigKey,
    WorkerPostToMainThreadEvent
} from './types'
import { fakeRequest } from '../utils/request'
import { encrypt } from '../utils/encryption'
import { IEncryptionConfig } from '../types/excryption'

/*********************************基本工具准备 start***********************************/

/**
 * 事件中心
 */
const workerEventBus = new Subscribe<BaseTransportEventType>()
/**
 * 数据预存
 */
const reportDataMap = new Map<RequestBundlePriorityEnum, IProcessingRequestRecord<SendDataTextType>[]>([
    [RequestBundlePriorityEnum.ERROR, []],
    [RequestBundlePriorityEnum.PERFORMANCE, []],
    [RequestBundlePriorityEnum.USERBEHAVIOR, []]
])

/**
 * 请求优先级
 */
const PRIORITY_ORDER: RequestBundlePriorityEnum[] = [
    RequestBundlePriorityEnum.ERROR,
    RequestBundlePriorityEnum.PERFORMANCE,
    RequestBundlePriorityEnum.USERBEHAVIOR
];

/**
 * axios实例 
 */
let axiosInstance: AxiosInstance
/**
 * 任务调度器
 */
let asyncTaskScheduler: TaskScheduler<TransportTask>
/**
 * 延时上报定时器
 */
let delayReportTimer: number | NodeJS.Timeout

/**
 * 一些需要通信完成初始化的自定义配置
 */
const customConfig: Map<WorkerConfigKey, TransportWorkerConfig[WorkerConfigKey]> = new Map()
function getRequestConfig<T extends WorkerConfigKey = WorkerConfigKey>(key: T) {
    return customConfig.get(key) as TransportWorkerConfig[T]
}

/**
 * 加密配置
 */
const encryptionConfig: IEncryptionConfig<'parsed'> = {
    SECRET_KEY: {} as CryptoJS.lib.WordArray,
    SECRET_IV: {} as CryptoJS.lib.WordArray
}
/**
 * 指示是否完成秘钥的解密
 */
let isParsedSecret: boolean = false
/**
 * 是否正在保存数据
 */
let isSaving: boolean = false

function parseEncryptionConfig(payload: IEncryptionConfig<'unParsed'>) {
    const { SECRET_IV, SECRET_KEY } = payload
    if (!SECRET_IV || !SECRET_KEY) {
        console.warn('SECRET_IV 与 SECRET_KEY 是必需的, 否则监控无法上报')
    }
    encryptionConfig.SECRET_IV = CryptoJS.enc.Utf8.parse(SECRET_IV)
    encryptionConfig.SECRET_KEY = CryptoJS.enc.Utf8.parse(SECRET_KEY)
    isParsedSecret = true
}

/**
 * 向主线程发送信息
 * @param order 
 * @returns 
 */
function postMessageToMainThread<T extends WorkerPostToMainThreadEvent = WorkerPostToMainThreadEvent>(order: {
    type: T,
    payload: IWorkerPostToMainThreadMessage[T]
}) {
    self.postMessage(order)
}


/**
 * 按优先级获取下一个待发送数据
 * @returns 
 */
function getNextData(): IProcessingRequestRecord<'ciphertext'> | null {
    let bundleData: IProcessingRequestRecord<SendDataTextType> = {
        textType: 'ciphertext',
        data: [],
        priority: RequestBundlePriorityEnum.USERBEHAVIOR,
        retryRecord: 0,
    }
    const singleMaxReportSize = getRequestConfig('singleMaxReportSize')
    for (const priority of PRIORITY_ORDER) {
        const queue = reportDataMap.get(priority)
        bundleData.priority = Math.max(bundleData.priority, priority)
        while (queue && queue.length && bundleData.data.length < singleMaxReportSize) {
            const queueHead = queue.shift()
            if (!queueHead) {
                return null
            }

            if (queueHead.textType === 'ciphertext' || queueHead.retryRecord) {
                // 密文或者重试数据直接返回
                return queueHead
            }
            bundleData.data.push(...(queueHead!.data))
        }
        if (bundleData.data.length >= singleMaxReportSize) break
    }

    if (!bundleData.data.length) {
        return null
    }
    const debugMode = getRequestConfig('debugMode')
    if (debugMode === false) {
        bundleData.data = [encrypt(JSON.stringify(bundleData.data), encryptionConfig)]
    }
    return bundleData
}
/**
 * 上报成功回调
 */
function handleRequestSuccess(params: IProcessingRequestRecord<'ciphertext'>) {
    // console.log('上报成功: ', params.data)
}
/**
 * 上报失败回调
 */
function handleRequestFailed(params: IProcessingRequestRecord<'ciphertext'>) {
    params.retryRecord++
    const retryCnt = getRequestConfig('retryCnt')
    if (params.retryRecord >= retryCnt) {
        return
    }
    if (params.retryRecord < retryCnt) {
        // 需要重试则加入尾部等待下一次发送
        reportDataMap.get(params.priority)?.push(params)
    }
    // TODO: 暂定 超过重试次数时直接舍弃, 更可靠的逻辑需要补充
}

/**
 * 上报请求逻辑
 * @param params 
 * @param type 'report' | 'returnParam' | undefined
 * @returns 
 */
async function sendWithRetry(
    params: IProcessingRequestRecord<'ciphertext'>,
    type?: TransportTaskRunType
) {
    const debugMode = getRequestConfig('debugMode')
    const requestHandler = debugMode ? fakeRequest : axiosInstance.post

    if (type === 'returnParam') return params

    const url = getRequestConfig('reportInterfaceUrl')
    try {
        await requestHandler(url, {
            [params.priority]: params.data
        });
        workerEventBus.notify('onPrepareNextReport')
        handleRequestSuccess(params)
    } catch {
        handleRequestFailed(params)
        // 失败处理逻辑
    }
}
/**
 * 读取下一次发送的数据并添加上报到异步调度器
 */
async function loadNextReportTask() {
    const nextData = getNextData()
    if (!nextData) return

    asyncTaskScheduler.addTask(() => (type?: TransportTaskRunType) => sendWithRetry(nextData, type))
    workerEventBus.notify('onPrepareNextReport')
}

/**
 * 终止发送
 * @returns 
 */
function saveRestDataToStoarge() {
    const restTasks = asyncTaskScheduler.stopScheduleAndReturnRestTasks()

    const res: Record<RequestBundlePriorityEnum, string[]> = {
        [RequestBundlePriorityEnum.ERROR]: [],
        [RequestBundlePriorityEnum.PERFORMANCE]: [],
        [RequestBundlePriorityEnum.USERBEHAVIOR]: []
    }
    restTasks.forEach(async (task) => {
        const unSendData = await task()('returnParam')
        if (unSendData) {
            const { data, priority } = unSendData
            res[priority].push(...data)
        }
    })

    const getUnEncryptedDataSize = () => {
        let cnt = 0
        for (const priority of PRIORITY_ORDER) {
            const queue = reportDataMap.get(priority)
            cnt += queue ? queue.length : 0
        }
        return cnt
    }
    while (getUnEncryptedDataSize()) {
        const nextData = getNextData()
        if (!nextData) continue
        res[nextData.priority].push(...nextData.data)
    }

    return res
}

/**
 * 上报任务预载
 */
function preLoadTask({ sendData, priority, textType = 'plaintext' }: IPreLoadParmas<MonitorTypes, BaseEventTypes, SendDataTextType>) {
    let data: IProcessingRequestRecord<SendDataTextType>['data'] = []
    if (textType === 'plaintext') {
        data = Array.isArray(sendData) ? sendData : [sendData]
    } else {
        data = [sendData]
    }
    reportDataMap.get(priority)?.push({ priority, textType, data, retryRecord: 0 })

    // 无加密不启动
    if (!isParsedSecret || isSaving || delayReportTimer) return

    delayReportTimer = setTimeout(() => {
        if (isParsedSecret) {
            workerEventBus.notify('onPrepareNextReport')
        }
        clearTimeout(delayReportTimer)
        delayReportTimer = 0
    }, getRequestConfig('transportDelay'))
}

/*********************************基本工具准备 end***********************************/



// TODO: 页面打开时从indexedDB读取未发送数据发送
// TODO: 页面关闭时把未发送的数据保存到indexedDB


/*********************************初始化方法准备 start***********************************/

/**
 * axios 实例化
 * @param param0 
 * @returns 
 */
function initAxios({
    reportbaseURL, timeout
}: Pick<TransportWorkerConfig, 'reportbaseURL' | 'timeout'>): AxiosInstance {
    const instance = axios.create({
        baseURL: reportbaseURL,
        timeout
    })
    instance.interceptors.request.use(
        (config) => {
            const customHeaders = getRequestConfig('customExtraRequestHeaderInfo')
            Object.assign(config.headers, customHeaders)
            return config
        },
        (error) => {
            postMessageToMainThread({
                type: 'reportAjaxError',
                payload: { error }
            })
        }
    )
    return instance
}
/**
 * 初始化异步调度器
 * @param param0 
 */
function initTaskScheduler({ reportTaskSizeLimit }: Pick<TransportWorkerConfig, 'reportTaskSizeLimit'>) {
    asyncTaskScheduler = new TaskScheduler(reportTaskSizeLimit)
}
/**
 * 初始化worker中的事件订阅, 启动自消费
 */
function initEventBusSubscribe() {
    workerEventBus.subscribe('onPrepareNextReport', () => loadNextReportTask())
}

function initConfig(payload: TransportWorkerConfig) {
    Object.entries(payload).forEach(([key, value]) => {
        customConfig.set((key as keyof TransportWorkerConfig), value)
    })
}

/*********************************初始化方法准备 end***********************************/

/*********************************处理主线程消息 start***********************************/

self.addEventListener('message', (ev: MessageEvent<ThreadMessage<'MainThread'>>) => {
    const { type, payload } = ev.data
    switch (type) {
        case 'preLoadRequest':
            preLoadTask(payload)
            break;
        case 'init':
            initConfig(payload)
            axiosInstance = initAxios(payload)
            initTaskScheduler(payload)
            initEventBusSubscribe()
            break;
        case 'sendEncryptionConfig':
            parseEncryptionConfig(payload)
            break;
        case 'stopSchedulerAndReturnUnsendData':
            break;
        default:
            break;
    }
})

self.addEventListener('beforeunload', () => {
    // const res = saveRestDataToStoarge()

    // console.log("🚀 ~ self.addEventListener ~ res:", res);

    postMessageToMainThread({
        type: 'saveBeforeUnload',
        payload: undefined
    })
})

/*********************************处理主线程消息 end***********************************/