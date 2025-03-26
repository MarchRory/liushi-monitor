<script setup lang="ts">
import { getCourses } from "@/api/courses/courses";
import { HomeSearchParams } from "./components/types";
import { useUserStore } from "@/store/modules/user";
import { selectCourseParams } from "@/api/types/courses";
import { debounce } from "@/utils/freqCtrl/freqCtrl";
import { useWsStore } from "@/store/modules/ws";
import { usePointStore } from "@/store/modules/point";
import { useFlagStore } from "@/store/modules/flag";
import { useMailStore } from "@/store/modules/mail";

const HomeHeader = defineAsyncComponent(
  () => import("./components/home-header.vue")
);
const CoursewaterFall = defineAsyncComponent(
  () => import("@/components/waterFall/index.vue")
);

defineOptions({
  name: "home",
});
const userStore = useUserStore();

const pageParams = ref<
  Pick<
    selectCourseParams,
    keyof Omit<selectCourseParams, "title" | "pageNum" | "pageSize">
  >
>({
  category: "",
  state: 0,
  departmentLimit: [],
  gradeLimit: [],
  userType: 0,
  reviewed: 0,
  passType: -1,
  // semesterId: userStore.semesterId
});
const handleTabChange = (newTab: number) => {
  pageParams.value.departmentLimit = newTab ? [userStore.departmentId] : [];
};
const handleFilterParamsChange = (newFilterParams: HomeSearchParams) => {
  const { category, state } = newFilterParams;
  pageParams.value.category = category;
  pageParams.value.state = +state;
};

const waterfall = ref();
const scrollTop = ref(0);

const handleScroll = debounce((curScrollTop: number) => {
  scrollTop.value = curScrollTop;
});

onActivated(() => {
  nextTick(() => {
    waterfall.value && waterfall.value.waterFallScrollTo(scrollTop.value);
  });
});

// 因为首页会被缓存, 所以init方法只会在第一次加载时触发, 后续都是触发onActived钩子
const init = () => {
  const wsStore = useWsStore();
  !wsStore.wsInstance && wsStore.initWs();
  const pointStore = usePointStore();
  const flagStore = useFlagStore();
  const mailStore = useMailStore();
  pointStore.updatePointTotal();
  flagStore.updateFlagCourseTotal();
  mailStore.updateMailTotal();
};

init();

onMounted(() => {
  $liushiMonitor.sendSpaLoadPerformance()
})
</script>

<template>
  <div class="pageContainer">
    <HomeHeader
      :category="pageParams.category"
      :state="pageParams.state"
      @on-tab-change="handleTabChange"
      @on-search-params-change="handleFilterParamsChange"
    />
    <main id="home-water-fall">
      <CoursewaterFall
        ref="waterfall"
        :request-api="getCourses"
        :column="2"
        :other-request-params="pageParams"
        @on-scroll="handleScroll"
      />
    </main>
  </div>
</template>

<style scoped lang="less">
.pageContainer {
  height: calc(100vh - var(--van-tabbar-height));
}
</style>
