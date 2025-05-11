import { IBaseAnalysisDataSearchQuery } from "../chart/types";

export interface IBaseHttpOverviewSearchQuery extends IBaseAnalysisDataSearchQuery {
    interfaceUrl: string
}

export interface IHttpOverview {
    totalRequests: number;
    todayRequests: number;
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
    methodDistribution: MethodDistribution[];
    statusCodeDistribution: StatusCodeDistribution[];
    interfaceUsage: InterfaceUsage[];
    hourlyDistribution: HourlyDistribution[];
    slowRequests: {
        count: number;
        percentage: number;
    };
}

export interface MethodDistribution {
    method: string;
    count: number;
    percentage: number;
}

export interface StatusCodeDistribution {
    statusCode: number;
    count: number;
    percentage: number;
}

export interface InterfaceUsage {
    interfaceUrl: string;
    count: number;
    percentage: number;
}

export interface HourlyDistribution {
    hour: string;
    count: number;
}

export interface FilterParams {
    startTime: string;
    endTime: string;
    url: string;
    interfaceUrl: string;
    refresh?: boolean;
}

// 定义错误总览数据接口
export interface IErrorOverviewData {
    totalErrors: number;
    fixedErrors: number;
    activeErrors: number;
    errorsByTime: {
        time_group: string;
        count: number;
    }[];
    errorsByType: {
        type: string;
        count: number;
    }[];
    errorsByUrl: {
        url: string;
        count: number;
    }[];
    topErrors: {
        id: number;
        url: string;
        timestamp: string;
        description: string;
        srcName: string;
        isFixed: boolean;
        count: number;
    }[];
}

export interface IErrorDetail {
    id: number;
    url: string;
    timestamp: string;
    description: string;
    codeLocation: any;
    srcName: string;
    props: any;
    stack: string;
}

// 定义错误列表接口
export interface IErrorListItem {
    id: number;
    url: string;
    timestamp: string;
    description: string;
    srcName: string;
    isFixed: boolean;
    count: number;
}


/**
 * 基础行为分析搜索参数
 */
export interface BaseBehaviorOverviewSearch {
    startTime: string;
    endTime: string;
    url: string;
    refresh?: boolean;
}

/**
 * 设备偏好分析数据类型
 */
export interface DevicePreferenceData {
    deviceTypeDistribution: Array<{
        deviceType: string;
        _count: number;
    }>;
    browserDistribution: Array<{
        deviceBowserName: string;
        _count: number;
    }>;
    osDistribution: Array<{
        deviceOs: string;
        _count: number;
    }>;
    deviceExposureTime: Array<{
        deviceType: string;
        count: number;
        avgExposureTime: number;
    }>;
}

/**
 * 漏斗分析数据类型
 */
export interface FunnelAnalysisData {
    funnelSteps: Array<{
        step: string;
        count: number;
    }>;
    pathTransitions: Array<{
        from: string;
        to: string;
        count: number;
    }>;
}

/**
 * 曝光深度分析数据类型
 */
export interface ExposureDepthData {
    exposureDistribution: Array<{
        time_range: string;
        count: number;
    }>;
    pathAvgExposure: Array<{
        path: string;
        avgExposureTime: number;
        count: number;
    }>;
}

/**
 * 用户行为总览数据类型
 */
export interface UserBehaviorOverviewData {
    overview: {
        views: {
            pv: number;
            uv: number;
            previousPv: number;
            previousUv: number;
        };
        interaction: {
            total: number;
            previousTotal: number;
            byType: Array<{
                eventTypeId: number;
                _count: number;
            }>;
        };
        exposure: {
            avgValue: number;
            previousAvgValue: number;
        };
    };
    trends: Array<{
        timestamp: string;
        views: number;
        interactions: number;
        exposureAvg: number;
    }>;
}