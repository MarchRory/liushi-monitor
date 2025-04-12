export const enum IResponseCodeEnum {
    SUCCESS = 200,
    NO_PERMISSION = 401
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
export type ListRequestParamsModel<T extends Object> = T & {
    pageNum: number
    pageSize: number
}