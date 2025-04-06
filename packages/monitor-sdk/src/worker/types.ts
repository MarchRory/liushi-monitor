import {
    BaseEventTypes,
    IPreLoadParmas,
    ISDKRequestOption,
    MonitorTypes,
    RequestBundlePriorityEnum,
    SendDataTextType
} from "../types"
import { IEncryptionConfig } from "../types/excryption"

export type TransportWorkerConfig = Required<ISDKRequestOption>
export type WorkerConfigKey = keyof TransportWorkerConfig

/**
 * worker向主线程通信的message类型
 */
export interface IWorkerPostToMainThreadMessage {
    /**
     * axios报错
     */
    reportAjaxError: { error: any }
    /**
     * 页面卸载前终止调度, 通知主线程缓存未发送的数据
     */
    saveBeforeUnload: undefined
}
export type WorkerPostToMainThreadEvent = keyof IWorkerPostToMainThreadMessage


/**
 * 主线程向worker通信的message类型
 */
export interface IMainThreadPostToWorkerMesage {
    /**
     * 预载上报任务
     */
    preLoadRequest: IPreLoadParmas<MonitorTypes, BaseEventTypes, SendDataTextType>
    /**
     * 终止调度并整理返回未上报数据
     */
    stopSchedulerAndReturnUnsendData: undefined
    /**
     * worker初始化
     */
    init: TransportWorkerConfig
    sendEncryptionConfig: IEncryptionConfig<'unParsed'>
}
export type MainThreadPostToWorkerEvent = keyof IMainThreadPostToWorkerMesage


type ThreadType = 'MainThread' | "WorkerThread"
type DistinguishMessageType<Src extends ThreadType> =
    Src extends 'MainThread'
    ? IMainThreadPostToWorkerMesage
    : IWorkerPostToMainThreadMessage;

export type ThreadMessage<Src extends ThreadType = ThreadType> = {
    [K in keyof DistinguishMessageType<Src>]: {
        type: K;
        payload: DistinguishMessageType<Src>[K];
    }
}[keyof DistinguishMessageType<Src>];