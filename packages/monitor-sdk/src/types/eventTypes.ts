import { MonitorTypes } from "./logger";

/**
 * 性能埋点事件
 */
export const performanceEventMap = {
    // 页面加载相关
    fp: '首次绘制',
    fcp: '首次内容绘制',
    lcp: '最大内容绘制',
    tti: '可交互时间',
    load: '页面加载完成时间',

    // 资源加载相关
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
    fid: '首次输入延迟'
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