<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from "vue";
import { scoreDetailType } from "@/api/types/annualReport/index";
import { gsap } from "gsap";
const props = defineProps<{
  scoreDetails: scoreDetailType;
}>();
const chartLoaded = ref(false);
const ScoreAndRankingChart = defineAsyncComponent(
  () => import("../charts/scoreDetailChart.vue")
);
const maxScoreCategory = computed(() => {
  let maxScore = Math.max(...Object.values(props.scoreDetails).map(Number));
  return Object.keys(props.scoreDetails).find(
    (key) => props.scoreDetails[key] == maxScore
  );
});
const tl = gsap.timeline();
const animationDurationCtrl = {
  chartDuration: 0.8,
  textDuration: 1,
  textStagger: 0.8,
};
function initChart() {
  chartLoaded.value = true;
  initTextAnimation();
}
function initTextAnimation() {
  tl.from(".footerText", {
    yPercent: 10,
    opacity: 0,
    duration: animationDurationCtrl.textDuration,
    stagger: animationDurationCtrl.textStagger,
  }).to(".footerText", {
    opacity: 1,
    yPercent: 0,
  });
}
onMounted(() => {
  if (props.scoreDetails) {
    initChart();
  }
});
</script>

<template>
  <div class="container">
    <div class="chartBox">
      <ScoreAndRankingChart
        class="chart"
        v-show="chartLoaded"
        :animation-duration="animationDurationCtrl.chartDuration"
        :score-details="scoreDetails"
      />
    </div>
    <span style="font-size: 30px" class="footerText">这一年, 你热衷于</span
    ><br />
    <span class="maxScoreCategory footerText">{{ maxScoreCategory }}</span>
  </div>
</template>

<style lang="less" scoped>
.container {
  width: 100vw;
  height: 100vh;
}
.chartBox {
  position: absolute;
  height: 40%;
  width: 100%;
  top: 10%;
}
.chart {
  width: 95%;
  height: 100%;
}
.footerText {
  position: absolute;
  top: 60%;
  text-align: left;
  height: 40%;
  width: 80%;
  color: #c88c67;
  font-weight: bold;
}
.maxScoreCategory {
  font-size: 90px;
  margin-top: 100px;
}
</style>
