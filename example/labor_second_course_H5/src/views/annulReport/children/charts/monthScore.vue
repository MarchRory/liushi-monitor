<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, watch, ref } from "vue";
import { gsap } from "gsap";
const props = defineProps<{
  data: Map<String, String>;
}>();
const option = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "line",
    },
  },
  title: {
    text: "分月统计",
    subtext: "让劳动成为习惯",
    left: "center",
    top: "top",
    textStyle: {
      fontSize: 20,
      color: "rgba(21, 137, 153, 1)",
    },
    subtextStyle: {
      fontSize: 10,
      fontFamily: "Arial",
    },
  },
  grid: {
    top: "25%",
    left: "5%",
    right: "18%",
    bottom: "5%",
    containLabel: true,
  },
  xAxis: [
    {
      name: "月份/月",
      data: Array.from(props.data.keys()),
      axisTick: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#82b0ec",
        },
      },
    },
  ],
  yAxis: [
    {
      name: "参加课程/门",
      type: "value",
      axisTick: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#82b0ec",
        },
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: "#aaa",
        },
      },
    },
  ],
  series: [
    {
      name: "参加课程",
      type: "bar",
      barWidth: `6%`,
      itemStyle: {
        color: "#277ace",
        borderRadius: 50,
        borderWidth: 0,
        borderColor: "#333",
      },
      data: Array.from(props.data.values()).map(Number),
    },
  ],
};
var chart: echarts.ECharts;
const chartLoaded = ref(false);
const monthScoreChart = ref<HTMLDivElement>();
function initChart() {
  if (!props.data) {
    return;
  }
  (async () => {
    if (!chart) {
      chart = echarts.init(monthScoreChart.value);
    }
    chart.setOption(option);
  })().finally(() => {
    chartLoaded.value = true;
  });
}
onMounted(() => {
  initChart();
});
watch(
  () => props.data,
  () => {
    initChart();
  }
);
watch(
  () => chartLoaded.value,
  (newVal) => {
    if (newVal) {
      gsap.fromTo(
        ".chart",
        {
          opacity: 0,
          scale: 0,
          duration: 2,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 2,
        }
      );
    }
  }
);
</script>

<template>
  <div v-show="chartLoaded" class="chart" ref="monthScoreChart"></div>
</template>

<style>
.chart {
  width: 100%;
  height: 100%;
}
</style>
