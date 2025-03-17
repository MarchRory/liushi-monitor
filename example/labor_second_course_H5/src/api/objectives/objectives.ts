import request from "@/utils/http/request";
import { useUserStore } from "@/store/modules/user";
import { Response } from "@/utils/http/types";
import { courseObjectivesResultModel } from "../types/courseObjectives";
enum API {
  objectiveDetail = "/curriculum/objectives/",
  semesterObjectiveList = "/curriculum/objectives/front/page",
  itemPage = "/curriculum/objectives/item/page",
}
const userStore = useUserStore();

/**
 * 获取学生本学期课程目标列表
 * @returns
 */
export function getUserObjects() {
  return request.get<Response<courseObjectivesResultModel>>(
    `${API.semesterObjectiveList}?pageNum=1&pageSize=100&semesterId=${userStore.semesterId}&userType=0`,
  );
}

/**
 * 获取课程规划详情
 * @param objId 选定的课程目标Id
 * @returns data.
 */
export function getObjDetail(objId: number) {
  return request.get(
    API.objectiveDetail + objId,
  );
}

/**
 *获取目标下绑定的课程列表
 * @param objId
 * @returns data.list -> 选定目标下的课程列表, data.total -> 选定课程目标下课程的总数
 */
export function getObjCourses(objId: number) {
  return request.get(
    `${API.itemPage}/${objId}?pageNum=1&pageSize=50`,
  );
}

/**
 * 获取学生指定学期的课程目标列表
 * @param params
 * @returns
 */
export function getObjects(params: {
  pageNum: number;
  pageSize: number;
  semesterId?: number | string;
  userType: number;
}) {
  return request.get(
    API.semesterObjectiveList,
    params,
  );
}
