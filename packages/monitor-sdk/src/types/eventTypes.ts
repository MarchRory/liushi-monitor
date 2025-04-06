import { MonitorTypes } from "./logger";

/**
 * 性能事件
 */
export const performanceEventMap = {
    // 项目首屏性能
    first_screen_indicators: {
        first_screen_fp: '首屏_首次绘制',
        first_screen_fcp: '首屏_首次内容绘制',
        first_screen_lcp: '首屏_首次最大内容绘制',
        // first_screen_fmp: '首屏_首次最有意义内容绘制', // TODO: 该指标计算逻辑复杂, 前期不施工
        first_screen_ttfb: '首屏_首字节时间'
    },

    spa_page_load_time: 'SPA页面_路由切换加载时间',

    // 资源加载
    dns: 'DNS 查询耗时',
    tcp: 'TCP 连接耗时',
    ttfb: '首字节时间',
    http: '接口请求时间',
    domReady: 'DOM 解析完成时间',
    script_execution: '脚本执行时间',

    // 渲染与交互
    cls: '累积布局偏移',
    inp: '输入交互响应延迟'
} as const;
export type PerformanceEventTypes = keyof typeof performanceEventMap

/**
 * 用户行为埋点事件
 */
export const userBehaviorEventMap = {
    click: '用户点击',
    pv: '页面访问量',
    uv: '用户访问量',
    page_exposure: '页面停留时间',
    module_exposure: '模块曝光时间'
} as const
export type UserBehaviorEventTypes = keyof typeof userBehaviorEventMap

/**
 * 报错埋点事件
 */
export const errorEventMap = {
    vue3_framework_error: 'Vue3框架层面报错',
    javaScript_sync_error: 'js同步代码报错',
    source_load_error: '资源加载报错',
    uncatch_promise_error: '未进行异常处理的报错',
    post_message_to_worker_error: '主线程向worker通信出错'

} as const
export type ErrorEventTypes = keyof typeof errorEventMap


/**
 * 内置基本监控事件类型
 */
export type BaseEventTypes<T extends MonitorTypes = MonitorTypes> =
    T extends 'performance' ? PerformanceEventTypes
    : T extends 'userBehavior' ? UserBehaviorEventTypes
    : T extends 'error' ? ErrorEventTypes
    : string

/**
 * 上报中心订阅事件类型
 */
export type BaseTransportEventType = 'onPrepareNextReport'

/**
 * 全局切面编程订阅事件类型
 */
export type BaseGlobalAOPEventType =
    'onPushAndReplaceState'
    | 'onPopState'
    | 'onVisibilityToBeHidden'
    | 'onClick'
    | 'onJavaScriptSyncError'

/**
 * SDK全局订阅事件类型
 */
export type GlobalSubscribeTypes<T extends MonitorTypes = MonitorTypes> = BaseEventTypes<T> | BaseTransportEventType | BaseGlobalAOPEventType