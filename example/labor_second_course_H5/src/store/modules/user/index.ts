import { defineStore } from "pinia";
import { getToken, setToken, removeToken } from "@/utils/auth/auth";
import { useWsStore } from "../ws";
import { useRouterCacheStore } from "@/store/modules/routerCache/index";
import { logOut } from "@/api/user/user";
import router from "@/router";
import { CateGoryScore, ObtainedScore } from "@/api/types/public";
import { getUserCateGoryScore, getUserObtainScore } from "@/api/plan";
import { nowSemesterType } from "@/api/types/user";
import { removeCookie } from "@/utils/cookie";
import { showFailToast } from "vant";

interface badge {
  hasEvaluateUnRead: boolean;
}

export interface userInfo extends badge {
  token: string | null;
  realName: String | null; // 真名
  name: string | null; // 网名
  sex: number | null;
  studentId: string | null; // 学号
  hasBind: boolean; // 是否绑定易班
  userId: string | null; // 报名时候用的这个id
  avatar: string | null;
  enrollmentYear: string | null; // 入学年份
  contact: object | null; // 联系方式
  semesterId: string; // 当前学期的ID
  semesterName: string | null; // 当前学期名
  departmentId: string;
  department: string;
  currentGrade: string; // 年级
  major: string | null; // 专业
  campus: string | null; // 校区地点, 例如成都
  EvaluationsCnt: number;
  cateGoryScore: CateGoryScore[];
  obtainedScore: ObtainedScore[];
}

export const useUserStore = defineStore("userInfo", {
  state: (): userInfo => {
    return {
      token: getToken(),
      realName: null,
      name: null,
      studentId: null, //学号
      avatar: null,
      hasBind: false,
      userId: null,
      enrollmentYear: null,
      sex: null,
      contact: null,
      semesterId: "",
      hasEvaluateUnRead: false,
      semesterName: null,
      departmentId: "",
      department: "",
      currentGrade: "",
      major: null,
      campus: null,
      EvaluationsCnt: 0,
      cateGoryScore: [], //学生个人计划的
      obtainedScore: [], //学生已经获得的分数
    };
  },
  actions: {
    init(token: string) {
      return new Promise((resolve) => {
        removeToken();
        setToken(token);
        resolve(true);
      });
    },
    clearToken() {
      return new Promise((resolve) => {
        removeToken();
        this.token = null;
        resolve(true);
      });
    },
    async initInfo(data: any, nowSemester: nowSemesterType) {
      if (!data.contact) {
        data.contact = {
          电话: null,
          QQ: null,
          微信: null,
          邮箱: null,
        };
      } else if (Object.values(data.contact).length < 4) {
        let keys = ["电话", "QQ", "微信", "邮箱"];
        keys.forEach((item: string) => {
          data.contact[item] = data.contact[item] ?? "";
        });
      }
      this.updateCateGoryScore();
      return new Promise((resolve) => {
        this.realName = data.name;
        this.name = data.nickname;
        this.studentId = data.studentId;
        this.avatar = data.avatar;
        this.hasBind = data.hasBind;
        this.userId = data.userId;
        this.sex = data.sex;
        this.contact = data.contact;
        this.semesterName = data.semesterName;
        this.semesterId = nowSemester.id as string;
        this.departmentId = data.departmentId;
        this.department = data.department;
        this.enrollmentYear = data.enrollmentYear;
        this.major = data.major;
        this.campus = data.campus;
        this.currentGrade = data.currentGrade;
        resolve(true);
      });
    },
    getEvaluationsCnt(data: number) {
      this.EvaluationsCnt = Number(data);
    },
    updateCateGoryScore() {
      getUserCateGoryScore().then(({ data }) => {
        this.cateGoryScore = data.list;
      });
      getUserObtainScore().then(({ data }) => {
        this.obtainedScore = data.filter(
          (item: any) =>
            item.name == "日常生活劳动" ||
            item.name == "劳动理论学习" ||
            item.name == "公益服务劳动" ||
            item.name == "其他方式劳动" ||
            item.name == "生产顶岗劳动" ||
            item.name == "“三下乡”社会实践"
        );
      });
    },
    logOut() {
      logOut().then((res) => {
        console.log(res, "res");
        this.clearToken()
          .then(() => {
            useWsStore().closeWebSocket();
            useRouterCacheStore().clearRouterCache();
            useUserStore().$reset();
            window.localStorage.clear();
            removeCookie("swpu_token");
            router.replace({ path: "/", query: { isLogOut: 1 } });
          })
          .catch((err) => {
            showFailToast(err);
          });
      });
    },
  },
  getters: {},
  persist: true, // 持久化
});
