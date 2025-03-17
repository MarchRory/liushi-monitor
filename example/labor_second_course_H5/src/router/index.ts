import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import mountRouterGuard from "./guard";
// import scan from "@/views/scanQR/index.vue";
export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    meta: {
      title: "登录",
      index: 1,
    },
    component: () => import("@/views/login/index.vue"),
  },
  {
    path: "/wait",
    name: "wait",
    meta: {
      title: "请稍后",
      index: 1,
    },
    component: () => import("@/views/welcome/index.vue"),
  },
  // 别乱改, 下面这个路由的子路由会自动生成首页底部tabbar
  {
    path: "/mainPage:",
    name: "layOut",
    component: () => import("@/layout/Layout.vue"),
    redirect: "/home",
    children: [
      {
        path: "/home",
        name: "home",
        component: () => import("@/views/home/index.vue"),
        meta: {
          title: "首页",
          icon: "tabler:brand-google-home",
          index: 1,
        },
      },
      {
        path: "/plan",
        name: "plan",
        meta: {
          title: "二课进度",
          icon: "tabler:brand-linktree",
          index: 1,
        },
        component: () => import("@/views/plan/index.vue"),
      },
      {
        path: "/user",
        name: "user",
        meta: {
          title: "个人中心",
          icon: "tabler:user-hexagon",
          index: 1,
        },
        component: () => import("@/views/user/index.vue"),
      },
    ],
  },
  {
    path: "/accountSetting",
    name: "accountSetting",
    meta: {
      title: "账户设置",
      index: 2,
    },
    component: () => import("@/views/user/children/accountSetting.vue"),
  },
  {
    path: "/userInfo",
    name: "UserInfo",
    meta: {
      title: "个人信息",
      index: 3,
    },
    component: () => import("@/views/user/children/baseInfo.vue"),
  },
  {
    path: "/userCourse",
    name: "userCourse",
    meta: {
      title: "我的课程",
      icon: "orders-o",
      index: 3,
    },
    component: () => import("@/views/userCourse/userCourse.vue"),
  },
  {
    path: "/password",
    name: "Password",
    meta: {
      title: "密码更新",
      index: 3,
    },
    component: () => import("@/views/user/children/passwordInfo.vue"),
  },
  {
    path: "/userObjectives",
    name: "UserObjectives",
    meta: {
      title: "历史规划",
      index: 2,
    },
    component: () => import("@/views/user/course/userObjectives.vue"),
  },
  {
    path: "/evalutions",
    name: "evalutions",
    meta: {
      title: "考评消息",
      index: 2,
    },
    component: () => import("@/views/evalutions/index.vue"),
  },
  {
    path: "/userObjectives",
    name: "UserObjectives",
    meta: {
      title: "历史规划",
      index: 2,
    },
    component: () => import("@/views/user/course/userObjectives.vue"),
  },
  {
    path: "/coursesPlanDetail",
    name: "coursesPlanDetail",
    meta: {
      title: "课程规划详情",
      index: 2,
    },
    component: () => import("@/views/plan/coursesPlanDetail/index.vue"),
  },
  {
    path: "/searchRes",
    name: "searchRes",
    meta: {
      title: "课程搜索",
      index: 2,
    },
    component: () => import("@/views/searchRes/index.vue"),
  },
  {
    path: "/detail",
    name: "detail",
    meta: {
      title: "课程详情",
      index: 3,
    },
    component: () => import("@/views/courseDetail/index.vue"),
  },
  {
    path: "/annulReportList",
    name: "annulReportList",
    meta: {
      title: "年度报告列表",
      index: 2,
    },
    component: () => import("@/views/annulReport/index.vue"),
  },
  {
    path: "/reportPage",
    name: "reportPage",
    meta: {
      title: "年度报告",
      index: 3,
    },
    component: () => import("@/views/annulReport/children/annulReport.vue"),
  },
  {
    path: "/guidePage",
    name: "guidetPage",
    meta: {
      title: "引导页",
      index: 1,
    },
    component: () => import("@/views/guide/index.vue"),
  },
  {
    path: "/command",
    name: "command",
    meta: {
      title: "课程评价",
      index: 3,
    },
    component: () => import("@/views/command/index.vue"),
  },
  {
    path: "/flag",
    name: "flag",
    meta: {
      title: "我的flag",
      index: 2,
    },
    component: () => import("@/views/Flag/index.vue"),
  },
  {
    path: "/createFlag",
    name: "createFlag",
    meta: {
      title: "立个Flag",
      index: 3,
    },
    component: () => import("@/views/Flag/children/createFlag.vue"),
  },
  {
    path: "/personalPlan",
    name: "personalPlan",
    meta: {
      title: "个人计划",
      index: 2,
    },
    component: () => import("@/views/personalPlan/index.vue"),
    redirect: "/personalPlan/userPlanList",
    children: [
      {
        path: "userPlanList",
        name: "userPlanList",
        meta: {
          title: "我的计划",
        },
        component: () =>
          import("@/views/personalPlan/children/my-plan-list.vue"),
      },
      {
        path: "createPlan",
        name: "createPlan",
        meta: {
          title: "待创建",
        },
        component: () =>
          import("@/views/personalPlan/children/create-plan-list.vue"),
      },
    ],
  },
  {
    path: "/createPlanForm",
    name: "createPlanForm",
    meta: {
      title: "创建计划",
      index: 3,
    },
    component: () =>
      import("@/views/personalPlan/children/create-plan-form.vue"),
  },
  {
    path: "/questionnaire",
    name: "questionnaire",
    meta: {
      title: "家长问卷调查",
      index: 3,
    },
    component: () => import("@/views/questionnaire/index.vue"),
  },
  {
    path: "/thirdPartyQuestionnaire",
    name: "thirdPartyQuestionnaire",
    meta: {
      title: "第三方问卷调查",
      index: 3,
    },
    component: () => import("@/views/questionnaire/thirdParty.vue"),
  },
  {
    path: "/honoraryTitle",
    name: "honoraryTitle",
    meta: {
      title: "荣誉墙",
      index: 2,
    },
    component: () => import("@/views/honoraryTitle/index.vue"),
  },
  /*   {
      path: "/scan",
      component: scan,
      redirect: "/scanQR",
      children: [
        {
          path: "scanQR",
          name: "scanQR",
          component: () => import("@/views/scanQR/scan/index.vue"),
          meta: {
            title: "扫码签到",
          },
        },
      ],
    }, */
  // 替代vue2中的'*'通配符路径
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHashHistory(), // history 模式则使用 createWebHistory()
  routes,
});

mountRouterGuard(router);

export default router;
