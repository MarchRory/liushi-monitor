import requestInstance from "../../utils/request";
import { IBaseChartDataSearchQuery, IPerformanceIndicatorChartData, PerformanceIndicatorName } from "./types";

export function getFirstScreenIndicatorChartData(indicatorName: PerformanceIndicatorName, query: IBaseChartDataSearchQuery) {
    return requestInstance.get<IPerformanceIndicatorChartData>(`analysis/performance/${indicatorName}`, query)
}