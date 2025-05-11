import { IListModel } from "../../types/request";
import requestInstance from "../../utils/request";
import { IBaseAnalysisDataSearchQuery, IErrorOverviewDataSearchQuery } from "../chart/types";
import { BaseBehaviorOverviewSearch, DevicePreferenceData, ExposureDepthData, FunnelAnalysisData, IBaseHttpOverviewSearchQuery, IErrorOverviewData, IHttpOverview, UserBehaviorOverviewData } from "./type";

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

/**
 * 获取有意义的用户行为URL选项
 */
export function getMeaningfulUserBehaviorUrlsOptions() {
    return requestInstance.get<IListModel<string>>('analysis/userbehavior/meaningful-urls');
}

/**
 * 获取用户行为总览数据
 */
export function getUserBehaviorOverview(query: BaseBehaviorOverviewSearch) {
    return requestInstance.get<UserBehaviorOverviewData>('analysis/userbehavior/overview', query);
}

/**
 * 获取设备偏好分析数据
 */
export function getDevicePreferenceAnalysis(query: BaseBehaviorOverviewSearch) {
    return requestInstance.get<DevicePreferenceData>('analysis/userbehavior/device-preference', query);
}

/**
 * 获取漏斗分析数据
 */
export function getFunnelAnalysis(query: BaseBehaviorOverviewSearch) {
    return requestInstance.get<FunnelAnalysisData>('analysis/userbehavior/funnel', query);
}

/**
 * 获取曝光深度分析数据
 */
export function getExposureDepthAnalysis(query: BaseBehaviorOverviewSearch) {
    return requestInstance.get<ExposureDepthData>('analysis/userbehavior/exposure-depth', query);
}