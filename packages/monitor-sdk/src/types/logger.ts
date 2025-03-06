/**
 * 埋点相关的数据类型
 */


/**
 * 内置基本埋点类型
 */
export const BaseLogTypeMap = {
    performance: '应用性能',
    userBehavior: '用户行为',
    error: '线上报错',
} as const



/**
 * SDK监控数据类型
 */
export type MonitorTypes = keyof typeof BaseLogTypeMap