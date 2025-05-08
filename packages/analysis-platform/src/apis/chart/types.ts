export interface IPerformanceIndicatorChartData {
    indicatorId: number;
    indicatorCn: string;
    url: string;
    timePoints: string[];
    values: (number | null)[];
    median: (number | null)[];
    p75: (number | null)[];
    p90: (number | null)[];
    count: (number | null)[];
}

export interface IBaseAnalysisDataSearchQuery {
    startTime: string
    endTime: string
    refresh: boolean
    url: string
}

export interface IErrorOverviewDataSearchQuery extends Omit<IBaseAnalysisDataSearchQuery, 'url'> {
    errorTypeId: number
}

export interface IBaseChartDataSearchQuery extends IBaseAnalysisDataSearchQuery {
    indicatorId: number
}

export type PerformanceIndicatorName =
    'lcp' | 'fp' | 'fcp' | "ttfb" | "cls" | "inp" | "spaload"