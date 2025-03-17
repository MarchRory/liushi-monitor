<script setup lang="ts">
import { computed, onMounted, defineAsyncComponent } from "vue";
import { gsap } from "gsap";
import { getKeyByValueInMap } from "@/utils/dataUtil/map";
const props = defineProps<{
  courseTotal: number;
  monthDetails: Map<String, String>;
  courseTimeTotal: number;
}>();
const MonthScoreChart = defineAsyncComponent(
  () => import("../charts/monthScore.vue")
);
const tl = gsap.timeline();
const chartLoad = ref(false);
const maxMonth = ref<String>();
function initHeaderAnimation() {
  setTimeout(() => {
    chartLoad.value = true;
  }, 3500);
  tl.from(".text", {
    duration: 3,
    scale: 0,
    opacity: 0,
    stagger: 0.5,
  })
    .to(".text", {
      opacity: 1,
      scale: 1,
    })
    .from(".footerText", {
      delay: 1,
      yPercent: 10,
      opacity: 0,
      stagger: 1,
    })
    .to(".footerText", {
      opacity: 1,
      yPercent: 0,
    });
}
function getMaxMonth() {
  let longestTime = Math.max(
    ...Array.from(props.monthDetails.values()).map(Number)
  );
  maxMonth.value = getKeyByValueInMap(props.monthDetails, longestTime);
}
watch(
  () => props.courseTotal,
  () => {}
);
const TimeText = computed(() => {
  let miniutes = Math.floor(props.courseTimeTotal / 60) % 60;
  let hours = Math.floor(props.courseTimeTotal / 3600);
  let minText = "";
  let hourText = "";
  if (miniutes > 0) {
    minText = miniutes + "分钟";
  }
  if (hours > 0) {
    hourText = hours + "小时";
  }
  return hourText + minText;
});
onMounted(() => {
  if (props.courseTimeTotal) {
    initHeaderAnimation();
    getMaxMonth();
  }
});
</script>

<template>
  <div class="container">
    <header>
      <div class="text">今年你一共参加</div>
      <div class="text">
        <span class="numberStyle">{{ props.courseTotal }}</span
        >门课程
      </div>
      <div class="text totalTime">{{ TimeText }}</div>
    </header>
    <MonthScoreChart v-if="chartLoad" class="chartBox" :data="monthDetails" />
    <footer>
      <span class="firText footerText">挥洒汗水最多是</span>
      <div class="footerText">
        <span class="numberStyle">{{ maxMonth }}</span>
        <span class="numberAfter">月</span>
      </div>
      <span class="footerText">还记得那段时光吗</span>
    </footer>
  </div>
</template>

<style scoped lang="less">
.container {
  width: 100vw;
  height: 100%;
  header {
    position: relative;
    bottom: 35%;
    font-size: 55px;
    font-weight: 900;
    color: rgb(23, 86, 145);
    .totalTime {
      font-size: 35px;
      padding-top: 5px;
    }
  }
  .chartBox {
    position: absolute;
    width: 650px;
    height: 600px;
  }
  footer {
    position: absolute;
    display: flex;
    align-items: center;
    flex-direction: column;
    bottom: 10%;
    color: #d5ae95;
    font-weight: bolder;
    .firText {
      font-size: 45px;
    }
  }
}
.numberStyle {
  font-size: 100px;
}
.numberAfter {
  font-size: 30px;
}
</style>
