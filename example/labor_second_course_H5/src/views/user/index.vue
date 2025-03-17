<template>
  <div class="user-center-container">
    <header>
      <UserCenterHeader />
    </header>
    <main id="user-main">
      <UserCard />
      <section>
        <KingkongTabCard title="我的" :tabs="courseTabs" />
        <!--  暂时没别的拓展功能 -->
        <KingkongTabCard v-if="false" title="更多功能" :tabs="extraFnTabs" />
        <HonorMedal></HonorMedal>
        <WishesSwiper />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import "vant/es/cell/style";
import "vant/es/cell-group/style";
import "vant/es/nav-bar/style";
import { defineAsyncComponent } from "vue";
import { useUserStore } from "@/store/modules/user";
import { getInfo } from "@/api/user/user";
import { showFailToast, showSuccessToast } from "vant";
import type { KingkongTabItem } from "./components/type";
import { usePointStore } from "@/store/modules/point";
import { useFlagStore } from "@/store/modules/flag";
import { useMailStore } from "@/store/modules/mail";
import { registerFmpLog } from "@/utils/logger/hooks";

defineOptions({
  name: "user",
});

const UserCenterHeader = defineAsyncComponent(
  () => import("./components/header.vue")
);
const UserCard = defineAsyncComponent(
  () => import("./components/user-card.vue")
);
const KingkongTabCard = defineAsyncComponent(
  () => import("./components/kingkong-tab-card.vue")
);
const WishesSwiper = defineAsyncComponent(
  () => import("./components/wishes-swpier.vue")
);
const HonorMedal = defineAsyncComponent(
  () => import("./components/honorMedal.vue")
);
const userStore = useUserStore();
const showParent = ref(true);
const route = useRoute();

const pointStore = usePointStore();
const flagStore = useFlagStore();
const mailStore = useMailStore();

const courseTabs = computed<KingkongTabItem[]>(() => [
  { label: "我的课程", icon: "tabler:books", path: "/userCourse", dot: false },
  {
    label: "考评信息",
    icon: "tabler:checks",
    path: "/evalutions",
    dot: userStore.EvaluationsCnt > 0,
  },
  {
    label: "年度报告",
    icon: "tabler:chart-area-line",
    path: "/annulReportList",
    dot: false,
  },
  {
    label: "荣誉墙",
    icon: "tabler:trophy",
    path: "/honoraryTitle",
    dot: false,
  },
  {
    label: "个人计划",
    icon: "tabler:list-numbers",
    path: "/personalPlan",
    dot: false,
  },
  { label: "我的Flag", icon: "tabler:flag-star", path: "/flag", dot: false },
  // { label: "引导", icon: "tabler:flag-star", path: "/guidePage", dot: false },
]);

// 拓展功能的KingkongTabs
const extraFnTabs = ref<KingkongTabItem[]>([]);

// 初始化, 获取个人信息
const init = () => {
  let query = Object.values(route.query);
  if (query.length && query.includes(true)) {
    userStore.init(userStore.token).then(() => {
      getInfo(userStore.token).then((res) => {
        const { studentId, name, pass, evaluate, department } = res[1].data;
        const objUser = {
          studentId,
          name,
          pass,
          evaluate,
          department,
        };
        const { userInfo, nowSemester } = res[0].data;
        const info = Object.assign(userInfo, nowSemester, objUser);
        userStore.initInfo(info).then((res) => {
          if (info.hasBind) {
            showSuccessToast("易班绑定成功");
          } else {
            showFailToast("遇到错误, 易班绑定失败");
          }
        });
      });
    });
    pointStore.updatePointTotal();
    flagStore.updateFlagCourseTotal();
    flagStore.updateFlagTotal();
    mailStore.updateMailTotal();
  }
  pointStore.updatePointTotal();
  flagStore.updateFlagCourseTotal();
  flagStore.updateFlagTotal();
  mailStore.updateMailTotal();
};

// 在路由更新前，检查是否要隐藏父级路由界面
// @ts-ignore
onBeforeRouteUpdate((to, from, next) => {
  // 在这里根据需要设置是否隐藏父级路由界面
  // 例如，可以根据子路由的名称或路径来判断是否要隐藏
  showParent.value = false;
  next();
});

init();

// 每次回到个人主页，都要更新一遍积分, 确保是最新的
onActivated(() => {
  pointStore.updatePointTotal();
});

registerFmpLog("user-main");
</script>

<style scoped lang="less">
.mainBox {
  margin-top: 30px;
  width: 100vw;
  height: calc(100vh - var(--van-tabbar-height) - var(--van-nav-bar-height));
}

.user-center-container {
  overflow-x: hidden;
  padding: 0 20px;
  height: calc(100vh - var(--van-tabbar-height));
  background: linear-gradient(to bottom, white 40%, rgb(245, 246, 248));
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  header,
  main {
    width: 100%;
    height: auto;
  }
  main {
    section {
      margin-top: 40px;
    }
  }
}
</style>
