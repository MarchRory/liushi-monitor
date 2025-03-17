/**
 * 后端的逻辑删除自动生成字段, 前端只需要在获取list的接口里, item的类型继承这个接口即可，
 * 新增item不需要传这些字段
 */
export interface TombstoneGeneratedFields {
  gmtCreate?: string;
  gmtModified?: string;
  createBy?: number;
  updateBy?: number;
  isDeleted?: number;
  id: string | number;
  [key: string]: any;
}

/**
 * 分页查询的基本参数, 需要拓展请继承这个接口
 */
export interface pageParams {
  key?: string | null;
  page?: number;
  pageNum?: number;
  pageSize: number;
  origin?: number;
}

/**
 * @description 基础分页请求返回的数据结构
 */
export interface ListResponseModel<T> {
  list: T[];
  total: number | string;
}

/**
 * @description 后端课程状态
 */
export const enum CourseStateEnum {
  /**
   * @description 0只用于查询全部, 没实际状态意义
   */
  all = 0,

  /**
   * @description 筹备中
   */
  prepare = 1,

  /**
   * @description 报名中
   */
  joining = 2,

  /**
   * @description 进行中
   */
  ing = 3,

  /**
   * @description 已结束
   */
  finished = 4,

  /**
   * @description 审核中
   */
  examining = 5,
}
type CourseStateMapType = {
  [state in CourseStateEnum]: {
    label: string;
    tagColor: string;
  };
};
export const courseStateMap: CourseStateMapType = {
  [CourseStateEnum.all]: {
    label: "全部",
    tagColor: "",
  },
  [CourseStateEnum.prepare]: {
    label: "筹备中",
    tagColor: "#f2856b",
  },
  [CourseStateEnum.joining]: {
    label: "报名中",
    tagColor: "#f0ad4e",
  },
  [CourseStateEnum.ing]: {
    label: "进行中",
    tagColor: "#5cb85c",
  },
  [CourseStateEnum.finished]: {
    label: "已结束",
    tagColor: "#b0b0b0",
  },
  [CourseStateEnum.examining]: {
    label: "审核中",
    tagColor: "#8b64e8",
  },
};

/**
 * @description 课程与学生报名有关的状态
 */
export const enum CourseSignUpStateEnum {
  /**
   * @description 审核未通过
   */
  rejetced = -1,

  /**
   * @description 未报名
   */
  normal = 0,

  /**
   * @description 已报名, 等待审核
   */
  waitToExamine = 1,

  /**
   * @description 审核通过, 被录取
   */
  admitted = 2,

  /**
   * @description 完成签到, 等待填写评价
   */
  completeSign = 3,

  /**
   * @description 完成评价的填写
   */
  completeComment = 4,

  /**
   * @description 获得教师考评， 至此课程全部完成
   */
  getEvaluation = 5,
}
type CourseSignUpStateMap = {
  [key in CourseSignUpStateEnum]: {
    [key: string]: any;
    /**
     * @description 按钮文本
     */
    btnText: string;

    /**
     * @description tag颜色, 会覆盖课程的tag
     */
    signUpTagColor: string;

    /**
     * @description 状态文本, 会覆盖课程的label
     */
    signUpLabel: string;
  };
};
export const CourseSignUpStateMap: CourseSignUpStateMap = {
  [CourseSignUpStateEnum.normal]: {
    btnText: "去报名",
    signUpLabel: "未报名",
    signUpTagColor: "#f0ad4e",
  },
  [CourseSignUpStateEnum.waitToExamine]: {
    btnText: "等待教师审核",
    signUpLabel: "审核中",
    signUpTagColor: "#bf80ff",
  },
  [CourseSignUpStateEnum.rejetced]: {
    btnText: "用户未通过审核",
    signUpLabel: "未过审",
    signUpTagColor: "#ff0505",
  },
  [CourseSignUpStateEnum.admitted]: {
    btnText: "等待活动开始",
    signUpLabel: "被录取",
    signUpTagColor: "#5fc80d",
  },
  [CourseSignUpStateEnum.completeSign]: {
    btnText: "去评价",
    signUpLabel: "待评价",
    signUpTagColor: "#5094d8",
  },
  [CourseSignUpStateEnum.completeComment]: {
    btnText: "等待教师考评",
    signUpLabel: "待考评",
    signUpTagColor: "#e0650e",
  },
  [CourseSignUpStateEnum.getEvaluation]: {
    btnText: "修读完成",
    signUpLabel: "已完成",
    signUpTagColor: "#4dd1c6",
  },
};

/**
 * @description 课程分类
 */
export const CourseCategoryMap = {
  全部: {
    value: "",
    tagColor: "#b0b0b0",
  },
  日常劳动: {
    value: "日常生活劳动",
    tagColor: "#d59539",
  },
  生产顶岗: {
    value: "生产顶岗劳动",
    tagColor: "#2dbbc0",
  },
  劳动理论: {
    value: "劳动理论学习",
    tagColor: "#5cb85c",
  },
  公益服务: {
    value: "公益服务劳动",
    tagColor: "#d9534f",
  },
  其他劳动: {
    value: "其他方式劳动",
    tagColor: "#a7a8bd",
  },
  三下乡: {
    value: "“三下乡”社会实践",
    tagColor: "#9d763e",
  },
  // 专业品牌: {
  //   value: "专业品牌",
  //   tagColor: "",
  // },
  // 创新创业: {
  //   value: "创新创业",
  //   tagColor: "#9d763e",
  // },
  // 社会实践: {
  //   value: "社会实践",
  //   tagColor: "#9d763e",
  // },
  // 职业能力: {
  //   value: "职业能力",
  //   tagColor: "#9d763e",
  // },
} as const;

/**
 * @description 课程类别, 传空串查全部
 */
export type CourseCategoryType =
  (typeof CourseCategoryMap)[keyof typeof CourseCategoryMap]["value"];

export interface CateGoryScore {
  id: string;
  objectivesId: string;
  affiliationGrade: string;
  grade: string;
  type: string;
  objectivesName: string;
  minRequirement: number;
  targetScore: number;
  progressScore: number;
  start: string;
  end: string;
  state: number;
}

export interface ObtainedScore {
  name: string;
  value: number;
}
