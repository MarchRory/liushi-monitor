import { ISDKInitialOptions } from "./option"

/**
 * 基本监控客户端中心
 */
export interface IBaseClient {
    readonly sdk_version: string
    readonly options: ISDKInitialOptions
}