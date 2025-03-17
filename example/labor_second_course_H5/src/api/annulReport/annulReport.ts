import request from "@/utils/http/request";
import * as annualReportTypes from '../types/annualReport/index'
import { AxiosRequestConfig } from "axios";
import { ListResponseModel } from "../types/public";
import { annualReportListItemType } from "../types/annualReport/index";

enum API {
    annualReportList = '/curriculum/academic_year_report/batch',
    annualReportDetail = '/curriculum/academic_year_report/create'
}

/**
 * 获取年度报告列表, state是3，拿到可访问报告
 * @returns 
 */
export function getAnnualReportListAPI(params: annualReportTypes.annualReportParamsType) {
    return request.get<ListResponseModel<annualReportListItemType>>(
        API.annualReportList,
        params,
    )
}

/**
 * 获取年度报告详情数据
 * @param annualReportId 
 * @returns 
 */
export function getAnnualReportDetailAPI(batchId: number | string) {
    return request.get<annualReportTypes.annulReportItem>(
        API.annualReportDetail + `/${batchId}`,
        {},
        {},
        { cache: true }
    )
}