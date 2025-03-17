import request from "@/utils/http/request";

enum API {
  ADD = "/curriculum/evaluate",
}

export type evaluateText = {
  courseId: number;
  studentId: string;
  completeness: number;
  satisfaction: number;
  proofPicture?: string;
  createBy: string;
  items?: evaluateItem[];
  unitName?: string;
  jobTitle?: string; //职位
  relation?: string;
};

export interface evaluateItem {
  id?: number;
  evaluateId?: number;
  title: string;
  text: string;
}

export function addEvaluateApi(data: evaluateText) {
  return request.post(API.ADD, data);
}
