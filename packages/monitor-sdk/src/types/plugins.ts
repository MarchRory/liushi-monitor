import { BaseTransport } from '../core'
import { BaseClient } from '../core/baseClient'
import { BaseEventTypes, IBaseTransformedData, IOriginalData, MonitorTypes } from '../types'

/**
 * 插件类型, 我们把不同功能的埋点能力分割为一个个插件, 通过引入插件拓展埋点能力
 */

/**
 * 底层基础插件, 包含最基本的插件信息和功能
 */
export interface IBasePlugin<T extends MonitorTypes, C extends BaseClient<T> = BaseClient<T>> {
    /**
     * 插件类型
     */
    type: T
    /**
     * 监听具体事件类型
     */
    eventName: BaseEventTypes<T>
    /**
     * 插件是否被禁用, 默认false 
     */
    isPluginEnabled?: boolean

    /**
     * 监控器, 对事件的具体监听逻辑实现, 最后需要通知订阅中心响应
     * @returns void
     */
    monitor: (client: C, notify: (eventName: BaseEventTypes<T>, originalData: IPluginTransportDataBaseInfo) => void) => void
    /** 数据转化器, 格式化监听到的数据
     * @param originalData 收集到的原始数据
     * @returns 
     */
    dataTransformer: (client: C, originalData: IPluginTransportDataBaseInfo) => IBaseTransformedData<T, BaseEventTypes<T>>
    /**
     * 消费处理后的数据, 进行附加数据添加、上报服务器等操作
     * @param transformedData 格式化后的数据
     * @returns 
     */
    dataConsumer: (transport: BaseTransport, encryptedData: string) => void
}

/**
 * 不需要额外上报data的监控具体事件
 */
type NotNeedDataEventType = 'pv' | 'uv'
/**
 * 插件上报数据格式
 */
export type IPluginTransportDataBaseInfo<E extends BaseEventTypes = BaseEventTypes, T extends object = object>
    = E extends NotNeedDataEventType ? {
        url: string
        timestamp: number
    } : {
        url: string
        timestamp: number
        data: T
    }