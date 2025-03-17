<script setup lang="ts">
import { scoreDetailType } from "@/api/types/annualReport";
import * as echarts from "echarts";
import { ref, onMounted, watch, computed } from "vue";
import { gsap } from "gsap";
const props = defineProps<{
  scoreDetails: scoreDetailType;
  animationDuration: number;
}>();
var chart: echarts.ECharts;
const chartLoaded = ref(false);
const scoreDetailChart = ref<HTMLElement>();
const pieColorList = ["#458ad9", "#f1c07c", "#56abc1", "#FD866A"];
const index = ref(0);
function chartFun() {
  var timer = setInterval(function () {
    chart.dispatchAction({
      type: "hideTip",
      seriesIndex: 0,
      dataIndex: index.value,
    });
    // 显示提示框
    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: index.value,
    });
    // 取消高亮指定的数据图形
    chart.dispatchAction({
      type: "downplay",
      seriesIndex: 0,
      dataIndex: index.value === 0 ? 4 : index.value - 1,
    });
    chart.dispatchAction({
      type: "highlight",
      seriesIndex: 0,
      dataIndex: index,
    });
    index.value++;
    if (index.value > 4) {
      index.value = 0;
    }
  }, 3000);
}
const mixin = {
  label: {
    show: true,
    position: "outside",
    formatter: "{hr|}\n{a|{d}%}\n{b|{b}}",
    color: "",
    rich: {
      hr: {
        borderColor: "",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 3,
        width: 3,
        height: 3,
        padding: [3, 3, 0, -12],
      },
      a: {
        padding: [-50, 5, -20, 10],
      },
      b: {
        padding: [-25, 5, -20, 10],
      },
    },
  },
};
const dataOpts = computed(() => {
  let names = Object.keys(props.scoreDetails);
  let values = Object.values(props.scoreDetails).map(Number);

  let dataArr: any[] = [];
  names.forEach((key, index) => {
    let mix = JSON.parse(JSON.stringify(mixin));
    mix.label.rich.hr.borderColor = pieColorList[index];
    mix.label.color = pieColorList[index];
    dataArr.push({
      name: key,
      value: values[index],
      ...mix,
    });
  });
  return dataArr;
});
const option = {
  title: {
    text: "本学年学分分布",
    left: "center",
    top: "top",
    textStyle: {
      fontSize: 15,
      color: "#95868a",
    },
  },
  tooltip: {
    trigger: "item",
  },
  series: [
    {
      type: "pie",
      center: ["50%", "50%"],
      radius: ["0%", "50%"],
      clockwise: true,
      avoidLabelOverlap: true,
      hoverOffset: 15,
      roseType: "radius",
      itemStyle: {
        color: function (params) {
          return pieColorList[params.dataIndex];
        },
      },
      label: {
        show: true,
        position: "outside",
        formatter: "{a|{b}: {d}%}\n{hr|}",
        rich: {
          hr: {
            backgroundColor: "t",
            borderRadius: 3,
            width: 3,
            height: 3,
            padding: [3, 3, 0, -12],
          },
          a: {
            padding: [-30, 15, -20, 15],
          },
        },
      },
      labelLine: {
        length: 10,
        length2: 20,
        lineStyle: {
          width: 1,
        },
      },
      data: [...dataOpts.value],
    },
  ],
};
function initChart() {
  if (!props.scoreDetails) {
    return;
  }
  (async () => {
    if (!chart && scoreDetailChart.value) {
      chart = echarts.init(scoreDetailChart.value);
    }
    chart.setOption(option);
  })().then(() => {
    chartLoaded.value = true;
  });
}
watch(
  () => chartLoaded.value,
  (newVal) => {
    if (newVal) {
      gsap.fromTo(
        ".scoreDetailChart",
        {
          scale: 0.7,
          duration: props.animationDuration,
        },
        {
          scale: 1,
          duration: props.animationDuration,
        }
      );
    }
  }
);
onMounted(() => {
  if (props.scoreDetails) {
    setTimeout(() => {
      initChart();
    }, 800);
  }
});
</script>

<template>
  <div
    class="scoreDetailChart"
    ref="scoreDetailChart"
    v-show="chartLoaded"
  ></div>
</template>

<style scoped lang="less">
.scoreDetailChart {
  width: 100%;
  height: 100%;
}
</style>
