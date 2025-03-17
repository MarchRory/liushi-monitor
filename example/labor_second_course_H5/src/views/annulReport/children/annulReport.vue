<script setup lang="ts">
import { getAnnualReportDetailAPI } from "@/api/annulReport/annulReport";
import { annulReportItem } from "@/api/types/annualReport";
import { useRoute, useRouter } from "vue-router";
import { Response } from "@/utils/http/types";
import { defineAsyncComponent } from "vue";
import { gsap } from "gsap";
import { showFailToast, showLoadingToast } from "vant";
import { registerTimingLog } from "@/utils/logger/hooks";
const AnnulReportLoading = defineAsyncComponent(
  () => import("../children/components/loadingPage.vue")
);
const CoverPage = defineAsyncComponent(
  () => import("../children/components/coverPage.vue")
);
const CourseTotalPage = defineAsyncComponent(
  () => import("../children/components/courseTotalPage.vue")
);
const ScoreAndRankingChart = defineAsyncComponent(
  () => import("../children/components/scoreAndRanking.vue")
);
const FirstCourse = defineAsyncComponent(
  () => import("../children/components/firstCourse.vue")
);
const MaxCourse = defineAsyncComponent(
  () => import("../children/components/maxCourse.vue")
);
const MaxEvalution = defineAsyncComponent(
  () => import("../children/components/maxEvalution.vue")
);
const KeywordPage = defineAsyncComponent(
  () => import("./components/keywordsPage.vue")
);
const route = useRoute();
const router = useRouter();
const touchPosWatch = ref({
  isMove: false,
  startY: 0,
  endY: 0,
});
const isDownload = ref(true);
const annualReportInfo = ref<annulReportItem>({} as annulReportItem);
const progress = ref<number>(0);
const currentPage = ref(1);
function getAnnualReportInfo() {
  getAnnualReportDetailAPI(
    route.query.reportId as string
  ).then((res: Response<annulReportItem>) => {
    const { success } = res;
    if (!success) {
      showFailToast("报告尚未生成完毕");
      goBack();
      return;
    }
    showLoadingToast({
      overlay: true,
      forbidClick: true,
      closeOnClick: false,
      closeOnClickOverlay: false,
      duration: 600,
      message: "加载中",
    });
    const { data } = res;
    data.monthDetails = new Map(Object.entries(data.monthDetails));
    annualReportInfo.value = data;
  }).catch(() => {
    goBack()
  })
}
function goBack() {
  router.push({path: '/annulReportList'})
}
function handleTouchStart(e: TouchEvent) {
  touchPosWatch.value.startY = e.touches[0].pageY;
}
function handleTouchEnd(e: TouchEvent) {
  let directionY = touchPosWatch.value.startY - touchPosWatch.value.endY;
  if (touchPosWatch.value.isMove && directionY < -200) {
    // 向上滑，且不是最后一页
    if (currentPage.value > 1) {
      currentPage.value--;
      touchPosWatch.value.isMove = false;
    }
  } else if (touchPosWatch.value.isMove && directionY > 200) {
    // 向上滑
    if (currentPage.value < 7) {
      currentPage.value++;
      touchPosWatch.value.isMove = false;
    }
  }
}
function handleTouchMove(e: TouchEvent) {
  touchPosWatch.value.isMove = true;
  e.preventDefault();
  touchPosWatch.value.endY = e.touches[0].pageY;
}
function onEnter(el: Element, done: () => void) {
  gsap.fromTo(
    el,
    {
      opacity: 0,
      duration: 0.8,
    },
    {
      opacity: 1,
      duration: 0.8,
      delay: 0.8,
      onComplete: done,
    }
  );
}
function onLeave(el: Element, done: () => void) {
  gsap.to(el, {
    opacity: 0,
    duration: 0.6,
    onComplete: done,
  });
}
getAnnualReportInfo();
watch(
  () => progress.value,
  (newVal) => {
    if (newVal >= 100) {
      currentPage.value = 1;
    }
  }
);

registerTimingLog()
</script>

<template>
  <div
    class="container"
    style="width: 100vw; height: 100vh; z-index: 10"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div id="backBtn">
      <van-icon name="arrow-left" size="18" @click="goBack" />
    </div>

    <transition @enter="onEnter" @leave="onLeave">
      <AnnulReportLoading :progress="progress" v-if="currentPage == 0" />
      <CoverPage
        v-else-if="currentPage == 1"
        style="position: absolute"
        @next-page="currentPage = 2"
        :batch-name="annualReportInfo.year"
      />
      <CourseTotalPage
        style="position: absolute"
        v-else-if="currentPage == 2"
        :course-total="Number(annualReportInfo.courseTotal)"
        :month-details="annualReportInfo.monthDetails"
        :course-time-total="Number(annualReportInfo.courseTimeTotal)"
      />
      <ScoreAndRankingChart
        style="position: absolute"
        v-else-if="currentPage == 3"
        :score-details="annualReportInfo.scoreDetails"
      />
      <FirstCourse
        v-else-if="currentPage == 4"
        :first-course="annualReportInfo.firstCourse"
      />
      <MaxCourse
        v-else-if="currentPage == 5"
        :max-course="annualReportInfo.maxCourse"
      />
      <MaxEvalution
        v-else-if="currentPage == 6"
        :max-evalution="annualReportInfo.maxEvaluate"
        :max-evaluate-course="annualReportInfo.maxEvaluateCourse"
      />
      <KeywordPage
        v-else-if="currentPage == 7"
        :keywords-obj="annualReportInfo.keyword"
      />
    </transition>
    <div id="tool">{{ currentPage < 7 ? '上划查看下一页' : '期待未来的故事' }}</div>
  </div>
</template>

<style scoped lang="less">
.container {
  background-image: linear-gradient(to top, #fff1eb 0%, #ace0f9 100%);
}
#backBtn {
  position: fixed;
  z-index: 20;
  left: 40px;
  top: 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background-color: rgba(189, 189, 189, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.24);
  color: white;
  font-weight: 800;
  backdrop-filter: blur(10px);
}
#tool {
  position: fixed;
  z-index: 999;
  left: 50%;
  transform: translate(-50%);
  font-size: 0.8rem;
  color: rgb(172, 171, 171);
  font-weight: bold;
  bottom: 60px;
  letter-spacing: 5px;
}
</style>
