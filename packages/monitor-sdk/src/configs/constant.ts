import { IBaseBreadCrumbOptions, ISDKRequestOption } from "../types"
import { DeepRequired } from "../types/utils"

export const SDK_VERSION = 'v1.0.0'
export const DEFAULT_LOCALSTORAGE_KEY = 'liushi_monitor_key'

/**
 * breadCrumbs默认配置
 */
export const DEFAULT_BREADCRUMB_CONFIG: DeepRequired<IBaseBreadCrumbOptions> = {
    ignore_urls: [],
    max_access_path_size: 15,
    max_bread_crumbs_stack_size: 50
}

export const DEFAULT_REQUEST_INIT_OPTIONS:
    Omit<Required<ISDKRequestOption>, 'reportUrl' | 'reportbaseURL' | 'reportInterfaceUrl'>
    & {
        /**
         * 一次性发送的请求条数限制, 考虑到浏览器单一域名下一次限制6条链接, 故设置为2, 尽量减少对业务请求的影响
         */
        requestQueueMaxSize: number
    }
    = {
    timeout: 4 * 1000,
    retryCnt: 3,
    singleMaxReportSize: 3,
    requestQueueMaxSize: 3
}