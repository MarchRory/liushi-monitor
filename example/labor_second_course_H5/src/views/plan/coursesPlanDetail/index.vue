<script setup lang="ts" name="coursePlanDetail">
import { useRoute } from "vue-router";
import { defineAsyncComponent, nextTick } from "vue";
import { showFailToast } from "vant";
import { waterBall } from "@/assets/base64Img";
import "echarts-liquidfill/src/liquidFill"; // echarts 水晶球 type
import * as echarts from "echarts";
import { getObjCourses, getObjDetail } from "@/api/objectives/objectives";
const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);
const route = useRoute();
const hasPass = ref(0);
const list = ref([] as any);
const skeletonLoad = ref(true);
const objInfo = ref({} as any);
const chartLoad = ref(false);
var waterBallChart: echarts.ECharts;
const chart = ref<HTMLElement>();
const courseSke = defineAsyncComponent(
  () => import("@/components/coursePageSkeleton/coursePageSkeleton.vue")
);

const getWaterBallOpts = (numerator: number, denominator: number) => {
  var rate =
    denominator == 0 ? 0 : Number((numerator / denominator).toFixed(1));
  const opts = {
    title: [
      {
        bottom: "0%",
        left: "center",
        text: "必修学分获取情况",
        textStyle: {
          color: "#4F515A",
          fontSize: 15,
          fontWeight: 600,
        },
      },
    ],
    series: [
      {
        type: "liquidFill",
        radius: "72%",
        //水波
        color: [
          "#def2fe",
          "#b6e3fc",
          new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "#72D1FB",
            },
            {
              offset: 0.8,
              color: "#43ABF7",
            },
          ]),
        ],
        data: [rate, rate, rate],
        center: ["50%", "50%"],
        label: {
          formatter: `${rate * 100}%`,
          fontSize: 30,
          fontWeight: 400,
          color: "#72D1FB",
        },
        itemStyle: {
          //opacity: 0.7, // 波浪的透明度
          shadowBlur: 0, // 波浪的阴影范围
        },
        outline: {
          borderDistance: 0,
          itemStyle: {
            borderWidth: 4,
            borderColor: "#ecebea",
            shadowBlur: 20,
          },
        },
        backgroundStyle: {
          color: "#fff",
        },
      },
      {
        type: "pie",
        center: ["50%", "50%"],
        radius: ["72%", "72%"],
        borderCap: "round",
        data: [
          {
            name: "",
            value: denominator == 0 ? 0 : (numerator / denominator) * 100, // 已经完成的学分
            labelLine: {
              show: false,
            },
            itemStyle: {
              borderColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#43ABF7",
                },
                {
                  offset: 1,
                  color: "#72D1FB",
                },
              ]),
              borderWidth: 5,
            },
            label: {
              show: false,
              position: "center",
            },
          },

          {
            //画水球
            name: "",
            value: 0,
            label: {
              position: "inside",
              backgroundColor: {
                image: waterBall,
              },
              shadowColor: "rgba(18, 64, 123, 0.38)",
              shadowBlur: 8,
              padding: 10,
              distance: 50,
            },
          },
          {
            //画剩余的刻度圆环
            name: "",
            value:
              denominator == 0
                ? 100
                : ((denominator - numerator) / denominator) * 100, // 没有完成的学分
            itemStyle: {
              color: "#ecebea",
            },
            label: {
              show: false,
              position: "center",
            },
            labelLine: {
              show: false,
            },
          },
          {
            name: "",
            value: 0.2,
            itemStyle: {
              color: "rgba(0,0,0,0)",
            },
          },
        ],
      },
    ],
  };

  return opts;
};

const initwaterBallChart = () => {
  if (!waterBallChart) {
    chartLoad.value = true;
    waterBallChart = echarts.init(chart.value);
    (async () => {
      waterBallChart.setOption(
        getWaterBallOpts(objInfo.value.completed, objInfo.value.fixRestrictions)
      );
      window.addEventListener("resize", () => {
        waterBallChart.resize();
      });
    })().finally(() => {
      chartLoad.value = false;
    });
  }
};

const isShowStats = ref(false);
const showStats = async () => {
  isShowStats.value = true;
  nextTick(() => {
    setTimeout(() => {
      initwaterBallChart();
    }, 150);
  });
};
const reLoad = ref(false);
const refresh = () => {
  reLoad.value = true;
  getObjCourses(Number(route.query.id))
    .then((res: any) => {
      if (res.code == 200) {
        list.value = res.data.list;
      }
    })
    .finally(() => {
      reLoad.value = false;
    });
};

(() => {
  let objId = Number(route.query.id);
  Promise.all([getObjDetail(objId), getObjCourses(objId)])
    .then((res: any) => {
      console.log(123);
      if (res[0].code == 200 && res[1].code == 200) {
        objInfo.value = res[0].data;
        list.value = res[1].data.list;
        if (list.value && list.value.length) {
          res[1].data.list.forEach((item: any) => {
            hasPass.value += item.signUpstate == 4 ? 1 : 0;
          });
        }
        console.log(objInfo.value, "objInfo.value");
      } else {
        showFailToast("网络异常, 课程信息获取失败");
      }
    })
    .finally(() => {
      skeletonLoad.value = false;
    });
  getObjDetail(objId).then((res: any) => {
    const { data } = res;
    objInfo.value = data;
  });
})();

onMounted(() => {
  $liushiMonitor.sendSpaLoadPerformance()
})
</script>

<template>
  <div>
    <course-ske :ske-load="skeletonLoad"></course-ske>

    <div class="container" v-if="!skeletonLoad">
      <XdHeader :title="objInfo.objectivesName">
        <template #right>
          <div v-if="list && list.length" @click="showStats">
            <van-icon name="bar-chart-o" size="35" />
          </div>
        </template>
      </XdHeader>

      <div v-if="list && list.length" class="list">
        <van-pull-refresh v-model="reLoad" @refresh="refresh">
          <course-list :prop-list="list"></course-list>
        </van-pull-refresh>
      </div>
      <van-empty v-else description="老师还没有给这个目标分配课程哦" />

      <van-popup
        v-model:show="isShowStats"
        round
        position="top"
        :style="{ height: '380px' }"
      >
        <div class="popup-container">
          <div id="chartTitle">
            <div>
              {{ objInfo.objectivesName }}
            </div>
          </div>

          <div id="otherInfo">
            <div>已完成修读课程: {{ hasPass }}</div>
            <div>该目标安排课程: {{ list.length }}</div>
          </div>

          <div id="chartBox">
            <van-skeleton :loading="chartLoad">
              <template #template>
                <div
                  :style="{
                    display: 'flex',
                    width: '100%',
                    flexDirection: 'column',
                  }"
                >
                  <van-skeleton-avatar :avatar-size="80" />
                  <van-skeleton-paragraph row-width="50%" />
                </div>
              </template>
            </van-skeleton>
            <div v-show="!chartLoad" id="chart" ref="chart"></div>
          </div>
        </div>
      </van-popup>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  header {
    .title {
      width: calc((100vw - 40px) / 2);
      font-family: Gen Jyuu Gothic;
      font-size: 42px;
      font-weight: 500;
      line-height: 32px;
      text-align: center;
      letter-spacing: 5px;
    }

    .seat {
      height: 100%;
      width: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .list {
    overflow-y: auto;
    height: calc(100vh - 140px);
    width: 100vw;
    overflow-x: hidden;
    background-color: rgb(245, 246, 248);

    :deep(.van-pull-refresh) {
      overflow-y: auto;
      height: calc(100vh - 140px);
    }
  }
}

.popup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  #chartTitle {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    div {
      padding-left: 20px;
      padding-right: 30px;
      width: 90%;
      font-size: 35px;
      font-weight: bold;
      letter-spacing: 1px;
      text-align: left;
      border-left: 10px solid rgb(254, 144, 26);
      margin-left: 5%;
      margin-top: 5%;
    }
  }

  #chartBox {
    width: 95%;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;

    #chart {
      width: 95%;
      height: 400px;
    }
  }

  #otherInfo {
    width: 95%;
    height: 130px;
    margin-top: 30px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    font-size: 32px;
    font-weight: 500;
  }
}
</style>
