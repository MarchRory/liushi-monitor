import { IBaseBreadCrumbOptions, ISDKRequestOption } from "../types"
import { DeepRequired } from "../types/utils"

export const SDK_VERSION = 'v1.0.0'
export const DEFAULT_LOCALSTORAGE_KEY = 'liushi_monitor_key'
/**
 * 当日uv收集记录表
 */
export const UV_RECORD_STORAGE_KEY = 'ls_uv_record_map'

/**
 * breadCrumbs默认配置
 */
export const DEFAULT_BREADCRUMB_CONFIG: DeepRequired<Omit<IBaseBreadCrumbOptions, 'tabbar_urls'>> = {
    ignore_urls: [],
    max_access_path_size: 15,
    max_bread_crumbs_stack_size: 50
}

/**
 * 上报中心默认配置
 */
export const DEFAULT_REQUEST_INIT_OPTIONS: Required<Pick<ISDKRequestOption, 'timeout' | 'retryCnt' | 'singleMaxReportSize' | 'reportTaskSizeLimit' | 'transportDelay'>> = {
    timeout: 4 * 1000,
    retryCnt: 3,
    singleMaxReportSize: 3,
    reportTaskSizeLimit: 2,
    transportDelay: 1500,
}

/**
 * FMP计算所用的资源元素权重表, 默认其他非资源元素的权重为1
 */
export const DEFAULT_FMP_ELEMENT_WEIGHT_TABLE = {
    svg: 2,
    canvas: 2,
    img: 3,
    embed: 4,
    video: 4
}

/**
 * 
 */
export const PAGE_PERFORMANCE_MONITOR_RECORD_STORAGE_KEY = 'ls_monitor_page_performance_record'

/**
 * 当全局默认点击次数达到该数值时, 将启动一次上报
 */
export const DEFAULT_CLICK_COUNT_WHEN_TRANSPORT = 50

export const DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT = 15

export const DEFAULT_TEMPORARY_BREADITEM_LIMIT = 15

export const DEFAULT_PV_TEMPORART_POOL_SIZE = 5