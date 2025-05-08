import { IListModel } from "../../types/request";
import requestInstance from "../../utils/request";
import { IBaseAnalysisDataSearchQuery, IErrorOverviewDataSearchQuery } from "../chart/types";
import { IBaseHttpOverviewSearchQuery, IErrorOverviewData, IHttpOverview } from "./type";

export function GetHttpDashboardOverview(query: IBaseHttpOverviewSearchQuery) {
    return requestInstance.get<IHttpOverview>('analysis/performance/http/overview', query)
}

export function GetSpaDashboardOverview(query: IBaseAnalysisDataSearchQuery) {
    return requestInstance.get('analysis/performance/spaload', query)
}

export function GetAllPageUrls() {
    return requestInstance.get<IListModel<{ url: string }>>('monitor/urls')
}

export function GetErrorOverView(query: IErrorOverviewDataSearchQuery) {
    return requestInstance.get<IErrorOverviewData>('analysis/error/overview', query)
}