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

    // 具体页面性能
    page_performance_indicators: {
        // fp: '首次绘制',
        // fcp: '首次内容绘制',
        // lcp: '最大内容绘制',
        // ttfb: '首字节时间',
        // fmp: '首次最有意义内容绘制',
        spa_page_load_time: 'SPA页面_路由切换加载时间'
    },

    // 资源加载
    dns: 'DNS 查询耗时',
    tcp: 'TCP 连接耗时',
    ttfb: '首字节时间',
    request: '请求耗时',
    response: '响应耗时',
    http_interaction: '接口响应速度',
    domReady: 'DOM 解析完成时间',
    scriptExecution: '脚本执行时间',

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
    vue3_framework_error: 'Vue3框架层面报错'
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
export type BaseTransportEventType = 'reportSuccess'

/**
 * 全局切面编程订阅事件类型
 */
export type BaseGlobalAOPEventType =
    'onPushAndReplaceState'
    | 'onPopState'
    | 'onPageHide'
    | 'onPageShow'
    | 'onBeforePageUnload'
    | 'onVisibilityToBeHidden'
    | 'click'

/**
 * SDK全局订阅事件类型
 */
export type GlobalSubscribeTypes<T extends MonitorTypes = MonitorTypes> = BaseEventTypes<T> | BaseTransportEventType | BaseGlobalAOPEventType