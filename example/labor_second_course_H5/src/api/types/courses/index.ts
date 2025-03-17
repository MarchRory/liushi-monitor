import { SuggestionContentItem } from "@/api/dimension";
import {
  CourseCategoryType,
  CourseSignUpStateEnum,
  CourseStateEnum,
  ListResponseModel,
  TombstoneGeneratedFields,
} from "../public";
import { WaterFallCard } from "@/components/waterFall/types";
import { RealCourseStateConfig } from "@/utils/course";

/**
 * 获取课程列表
 */
export interface selectCourseParams {
  title: string | null; // 课程名关键字, 用于输入框搜索
  category: CourseCategoryType; // 课程标签关键字, 用于首页按照标签查找
  pageNum: number;
  pageSize: number;
  semesterId?: string; // 学年id, 但是因为需求变了的原因, 还是沿用这个key
  departmentLimit: string[];
  gradeLimit: string[];
  userType?: number;
  state: CourseStateEnum; // 课程状态,   0->全部,  1->筹备中, 2->报名中， 3->进行中, 4->已结束
  passType?: number; // 查询全部
  reviewed?: number | null;
}

export interface CourseDimensionality {
  id: string;
  name: string;
  scale: number;
}
export interface coursesItem extends WaterFallCard {
  state: CourseStateEnum;
  id: string;
  title: string;
  score: number;
  semester: string | null;
  numberlimit: number | null;
  departmentLimits: string[];
  gradeLimit: string[];
  courseManager: null | string;
  courseLocation: string | null;
  applicationStart: string;
  applicationEnd: string;
  hostingEnd: string;
  hostingStart: string;
  courseCategory: CourseCategoryType;
  pointsRules: string;
  ruleContent: string | null;
  scoringStandards: string;
  organizer: string;
  undertaker: string;
  introduction: string;
  contact: string;
  attachment: string;
  signUpCount: number;
  signUpstate: CourseSignUpStateEnum;
  objectivesType: number | null;
  /**
   * @description 课程维度评价数据，分页请求里是null, 详情才有数据
   */
  dimensionalityInfo: CourseDimensionality[] | null;
}
export type coursesListResultModel = ListResponseModel<coursesItem>;

// 评语维度
export interface CommentDimensionItem {
  id: number;
  title: string;
  content: string;
  icon?: string;
}

export interface commentToCourseObj {
  score: number; // 自嗨的打分
  courseId: number;
  evaluateText: string; // 课程建议
  anonymous: boolean; // 是否匿名
  detailCommand: SuggestionContentItem[];
}

export interface commentToSelfObj {
  courseId: number | null; // 课程id
  score: number; // 打分, 不打则在80到90间生成随机数
  evaluateText: string;
}

export interface signInfo {
  courseId: number | string;
  code: string;
}

export interface page {
  page: number;
  pageSize: number;
}

export type EvalutionItem = Pick<WaterFallCard, "cover"> & {
  // uid?: string | number
  // title?: string
  // text?: string
  // courseId?: string | number
  // evaluate?: string
  // pass: number
  // attendance: number
  // checked: boolean
  // score: number
  title: string;
  courseId: string;
  score: number;
  text: string;
  checked: boolean | null;
};

export type evalutionListResultModel = ListResponseModel<EvalutionItem>;

export type CourseCardQuery = RealCourseStateConfig & { courseId: string };

export interface commentToCourse {
  departmentId: number;
  type: number;
  origin: string;
}
