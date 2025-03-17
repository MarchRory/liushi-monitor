import { CourseCategoryType, TombstoneGeneratedFields } from "../public/index";

/**
 * 账号密码的参数类型
 */
export interface loginParams {
  username: string;
  password: string;
}
/**
 * 根据token获取用户信息的返回data类型
 */
interface tokenUserInfoType {
  hasBind: boolean;
  userId: string | number;
  username: string;
  avatar: string | undefined | null;
  nickname: string;
}
export interface nowSemesterType extends TombstoneGeneratedFields {
  semesterName: string;
  start: string;
  end: string;
}

export interface getInfoByTokenResultModel {
  userInfo: tokenUserInfoType;
  permissions?: any;
  roles?: any;
  nowSemester: nowSemesterType;
}

/**
 * 根据token获取学生信息的返回data类型
 */
interface contactType {
  QQ?: string;
  微信?: string;
  电话?: string;
  邮箱?: string;
}
export interface getInfoByStuIdResultModel {
  avatar: string | null | undefined;
  userId: string | number;
  name: string | null;
  pass?: null | boolean;
  evaluate?: null | number | string | boolean;
  department: string | null | undefined;
  sex: number | null;
  enrollmentYear: string | null;
  contact: contactType;
}

export const enum PointTypeEnum {
  /**
   * @description 完成签到
   */
  completeSign = 0,

  /**
   * @description 寄语
   */
  writeMailToSelf = 1,

  /**
   * @description 完成计划
   */
  completeSelfPlan = 2,

  /**
   * @description 优质评价
   */
  goodCommend = 3,

  /**
   * @description 完成评价
   */
  completeCommend = 5,
}
export interface PointItem extends TombstoneGeneratedFields {
  content: string; // 积分内容
  point?: number; // 积分值
  departmentId: string; // 学院id
  type: PointTypeEnum; // 积分来源
  state: 0 | 1; // 积分是否启用, 0-禁用, 1-启用
}

/**
 * @description 添加积分的数据结构, 用于query或者body, origin是积分来源, 传文字
 */
export type AddPointData = Pick<
  PointItem,
  "point" | "state" | "type" | "departmentId"
> & { origin: string };

export type PointHistoryItem = Pick<PointItem, "id"> & {
  name: string;
  integralName: string; // 积分项
};

/**
 * @description 寄语
 */
export interface MailToSelfItem extends TombstoneGeneratedFields {
  content: string;
  uid: string;
  courseId: string;
}

/**
 * @description 计划状态
 */
export const enum PlanState {
  // 计划未开始, 后端不存在这个状态, 由前端根据时间计算
  beforeStart = 3,
  // 计划进行中
  ing = 2,
  // 计划已完成
  complete = 1,
  // 计划未达成
  fail = 0,
}

/**
 * @description 创建计划的表单
 */
export type PlanForm = Pick<PlanItem, "objectivesId" | "targetScore"> & {
  state: PlanState;
  uid: string;
};

/**
 * @description 完成计划的表单
 */
// export type CompletePlanForm = TombstoneGeneratedFields & AddPointData
export interface CompletePlanForm {
  id: number;
  departmentId: number;
  type: number;
  origin: string;
}

/**
 * @description 待创建计划
 */
export interface ToCreatePlanItem extends TombstoneGeneratedFields {
  objectivesName: string; // 目标名
  semesterId?: string | number; // 暂无意义
  fixRestrictions: number; // 最低修读分数要求
  departmentId: number; // 学院id
  departmentName: string;
  majorId: number; // 专业id
  majorName: string;
  grade: string; // 年级
  type: CourseCategoryType; // 课程类别
}

/**
 * @description 个人计划
 */
export interface PlanItem extends ToCreatePlanItem {
  id: number; // 计划Id
  objectivesId: number; // 对应后台的教师创建的目标id
  affiliationGrade: string; // 所属学年
  minRequirement: number; // 最低修读分数要求
  targetScore: number; // 学生规划的个人目标学分
  progressScore: number; // 当前完成的学分
  state: PlanState; // 计划状态
  start: Date | String;
  end: Date | String;
}
