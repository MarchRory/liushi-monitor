import { BaseEventTypes, IBaseTransformedData, MonitorTypes } from "."

/**
 * 上报优先级枚举, 适配bullmq,数值越小, 
 */
export const enum RequestBundlePriorityEnum {
    ERROR = 1,
    PERFORMANCE,
    USERBEHAVIOR,
}

export interface IProcessingRequestRecord<T extends SendDataTextType = 'plaintext'> {
    data: (T extends 'plaintext' ? IBaseTransformedData<MonitorTypes, BaseEventTypes> : string)[]
    /**
     * 文本类型
     */
    textType: SendDataTextType,
    /**
     * 上报优先级
     */
    priority: RequestBundlePriorityEnum
    /**
     * 重试次数记录
     */
    retryRecord: number
}

/**
 * report -> 常规上报 [默认值]
 * returnParam -> 直接返回待上报的参数, 用于页面关闭前缓存未上报的数据
 */
export type TransportTaskRunType = 'report' | 'returnParam' | undefined
export type TransportTask = () => (type?: TransportTaskRunType) => Promise<IProcessingRequestRecord<'ciphertext'> | undefined>

export type SendDataTextType = 'ciphertext' | 'plaintext'

/**
 * 上报预载方法的参数
 */
export type IPreLoadParmas<T extends MonitorTypes, E extends BaseEventTypes<T>, S extends SendDataTextType> = {
    /**
     * 加密后的待上报数据
     */
    sendData: S extends 'plaintext' ? IBaseTransformedData<T, E> : string
    textType?: SendDataTextType

} & Pick<IProcessingRequestRecord, 'priority'>