import request from "@/utils/http/request";
import {
  CateGoryScore,
  CourseCategoryType,
  ListResponseModel,
  pageParams,
} from "./types/public";
import {
  CompletePlanForm,
  PlanForm,
  PlanItem,
  ToCreatePlanItem,
} from "./types/user";

const enum API {
  TeacherPlan = "/curriculum/planning",
  userPlan = "/curriculum/planning",
}

export function getPlanListAPI(
  params: pageParams & { grade: string; type?: CourseCategoryType }
) {
  return request.get<ListResponseModel<PlanItem>>(
    API.TeacherPlan + "/page/front",
    params
  );
}

export function createPlanAPI(data: PlanForm) {
  return request.post(API.userPlan, data);
}
// 完成计划
export function completePlanAPI(params: CompletePlanForm) {
  return request.post(API.userPlan + "/completion", params);
}

export function getToCreatePlanList() {
  return request.get<ToCreatePlanItem[]>(API.TeacherPlan);
}

/**
 * @description 获取学生本科期间, 计划的修读总分
 * @returns
 */
export function getUserCateGoryScore() {
  return request.get<ListResponseModel<CateGoryScore>>(
    API.TeacherPlan + "/page/front"
  );
}

/**
 * @description 获取学生本科期间修读分数
 * @returns
 */
export function getUserObtainScore() {
  return request.get(API.TeacherPlan + "/grades");
}
