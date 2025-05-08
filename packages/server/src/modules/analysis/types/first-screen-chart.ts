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

export enum PerformanceIndicatorEnum {
    LCP = 1,
    FP,
    FCP,
    TTFB,
    SPA_LOAD_TIME
}