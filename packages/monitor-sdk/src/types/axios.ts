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
    priority: RequestBundlePriorityEnum
    retryRecord: number
}