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