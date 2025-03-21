/**
 * 请求优先级枚举
 */
export const enum RequestBundlePriorityEnum {
    ERROR = 3,
    PERFORMANCE = 2,
    USERBEHAVIOR = 1
}

export interface IProcessingRequestRecord {
    data: string[] // 一次性携带多个
    /**
     * 上报优先级
     */
    priority: RequestBundlePriorityEnum
    /**
     * 重试次数记录
     */
    retryRecord: number
    /**
     * 自定义额外回调
     */
    customCallback?: {
        /**
         * 上报成功的回调
         * @param args 
         * @returns 
         */
        handleCustomSuccess?: (...args: any[]) => any,
        /**
         * 上报失败的回调
         * @param args 
         * @returns 
         */
        handleCustomFailure?: (...args: any[]) => any
    }[]
}

/**
 * 上报预载方法的参数
 */
export type IPreLoadParmas = {
    /**
     * 加密后的待上报数据
     */
    sendData: string | string[],

} & Pick<IProcessingRequestRecord, 'priority' | 'customCallback'>