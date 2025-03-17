import request from "@/utils/http/request";
import { departmentResultModel, majorPageParmas, majorResultModel } from "../types/department";
import { ListResponseModel, pageParams } from "../types/public";
enum API {
  departmentList = "/user/department/page",
  majorList = '/user/major/page'
}

/**
 * 查询学院列表
 * @returns
 * @param params
 */
export function getDepartments(params: pageParams) {
  return request.get<ListResponseModel<departmentResultModel>>(
    API.departmentList,
    params,
  );
}

/**
 * 根据学院查询专业列表
 * @param params 
 * @returns 
 */
export function getMajorList(params: majorPageParmas, data = []) {
  return request.post<ListResponseModel<majorResultModel>>(
    API.majorList,
    data,
    { params }
  )
}
