import type { InternalAxiosRequestConfig } from 'axios'
import { ErrorEventTypes, PerformanceEventTypes, UserBehaviorEventTypes } from './eventTypes'
import { EncryptedDataType, IBaseTransformedData, IOriginalData } from './logData'
import { IBaseBreadCrumbOptions } from './breadCrumb'
import { IBasePlugin } from './plugins'
import { MonitorTypes } from './logger'

/**
 * SDK上报method和上报接口
 */
export interface ISDKRequestOption {
    [key: string]: any
    /**
     * 上报的baseURL
     */
    reportbaseURL: string
    /**
     * 上报接口地址
     */
    reportInterfaceUrl: string
    /**
     * 调试模式, 开始后收集到的数据将以伪请求的方式进行打印, 代替真实上报
     * 但不适用于请求测速插件
     */
    debugerMode?: boolean
    /**
     * 超时时间
     */
    timeout?: number
    /**
     * 请求失败时的重试次数, 默认0
     */
    retryCnt?: number
    /**
     * 单次请求最多携带的上报数据条数
     */
    singleMaxReportSize?: number
    /**
     * 自定义请求头内容
     */
    customHeader?: Record<string, string>
}

/**
 * SDK的数据处理HOOK
 */
export interface IMonitorHooks {
    /**
     * 数据收集完成后触发的hook
     * @param eventName 监控事件类型
     * @param originalData 收集的原始监控数据
     * @returns 抛出一个携带二次处理的原始数据的promise
     */
    onDataCollected?(eventName: PerformanceEventTypes | ErrorEventTypes | UserBehaviorEventTypes, originalData: IOriginalData): Promise<IOriginalData>
    /**
     * 数据格式化完成后触发的hook
     * @param eventName 
     * @param transformedData 
     * @returns 抛出一个携带二次处理的格式化数据的promise
     */
    onDataTransformed?(eventName: PerformanceEventTypes | ErrorEventTypes | UserBehaviorEventTypes, transformedData: IBaseTransformedData): Promise<IBaseTransformedData>
    /**
     * 数据加密完成，即将进入上报流程之前触发的hook
     * @param encryptedData 数据加密后的字符串
     * @returns 抛出一个携带对加密字符串二次处理后得到的新JSON的promise
     */
    onBeforeDataReport?(encryptedData: EncryptedDataType): Promise<EncryptedDataType>
    /**
     * http请求发送前触发的hook, 可以最后对请求的config进行修改
     * @param config ajax请求的原始配置项
     * @returns 处理后的ajax请求配置项 (可能在header中新增了一些字段)
     */
    onBeforeAjaxSend?(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig
}

/**
 * SDK初始化配置参数
 */
export interface ISDKInitialOptions extends ISDKRequestOption {
    /**
     * 秘钥
     */
    sdkKey: string
    /**
     * 当页面卸载，部分没来得及上报的数据会被缓存到本地缓存中，等待下次启动app后重新上报
     * 缓存的key由用户在此指定
     */
    /**
     * 获取需要上传的用户身份信息的方法
     * @returns {object} userInfo
     */
    getUserInfo: () => object
    /**
     * 自定义数据加密方法
     * @param transformedJsonData 格式化后的数据, 已经进行过JSON序列化
     * @returns {string} 加密后的数据
     */
    dataEncryptionMethod: (transformedJsonData: string) => EncryptedDataType
    localStorageKey: string
    /**
     * 上报防抖时间
     */
    debounceTime?: number
    /**
     * 是否禁用sdk
     */
    disbled?: boolean
    /**
     * 自定义路由面包屑配置
     */
    customBreadCrumb?: IBaseBreadCrumbOptions
    /**
     * 数据处理HOOK
     */
    hooks?: IMonitorHooks
    /**
     * 自定义插件
     */
    customPlugins?: IBasePlugin<MonitorTypes>[]
}

