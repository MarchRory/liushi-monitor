export const enum IResponseCodeEnum {
    SUCCESS = 200,
    NO_PERMISSION = 401,
    KEY_EXIT = 1004,// P2002 唯一约束
    RECORD_NOT_FOUND = 1005,  // P2025 记录不存在
    FOREIGN_KEY_ERROR = 1006, // P2003 外键约束
    REDIS_ERROR = 5003,       // Redis 异常
}

export interface IHttpError {
    message: string
    error: string
    statusCode: number
}

/**
 * 响应数据模型
 */
export interface IResponseModel<T = any> {
    messageText: string
    code: number
    data: T
}

/**
 * 列表数据模型
 */
export interface IListModel<T extends Object> {
    total: string
    list: T[]
}

/**
 * 列表请求参数模型
 */
export type ListRequestParamsModel<T extends Object = Object> = T & {
    pageNum: number
    pageSize: number
}