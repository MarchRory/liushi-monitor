<script setup lang="ts">
import { HeaderDefaultAction } from "@/components/header/types";
import { useRoute } from "vue-router";
import {
  getCourseDetail,
  joinCourse,
  createLinkApi,
} from "@/api/courses/courses";
import useLoading from "@/hooks/useLoading";
import { coursesItem } from "@/api/types/courses";
import { useUserStore } from "@/store/modules/user";
import {
  CourseSignUpStateEnum,
  CourseSignUpStateMap,
  CourseStateEnum,
  courseStateMap,
} from "@/api/types/public";
import {
  formatCover,
  generateCourseStateConfig,
  getCategoryConfig,
} from "@/utils/course";
import { changeColorOpacity } from "@/utils/color";
import { EChartsOption } from "echarts";
import { getSpecificValueIntoArr } from "@/utils/common/array";
import * as echarts from "echarts";
import { debounce } from "@/utils/freqCtrl/freqCtrl";
import router from "@/router";
import { showFailToast, showSuccessToast } from "vant";
import { useBoolean } from "@/hooks/common";

const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);
const XdLoading = defineAsyncComponent(
  () => import("@/components/loading/index.vue")
);
const SignComp = defineAsyncComponent(
  () => import("./components/sign-popup.vue")
);
const RefreshBall = defineAsyncComponent(
  () => import("@/components/suspension/ball.vue")
);
const DimensionChart = defineAsyncComponent(
  () => import("@/components/chart/index.vue")
);

const route = useRoute();
const createLink = ref<string>("");
const createThirdLink = ref<string>("");
const detailInfo = ref({} as coursesItem);
const { loading: initLoading, setLoading: setInit } = useLoading(false);
const init = async () => {
  setInit(true);
  getCourseDetail(route.query.courseId as string)
    .then(({ data }) => {
      const { cover } = data;
      const coverObj = formatCover(cover as unknown as string);
      data.cover = coverObj;
      detailInfo.value = data;
    })
    .catch(() => {
      router.push({ path: "/home" });
      setTimeout(() => {
        showFailToast("课程状态异常");
      }, 500);
    })
    .finally(() => {
      setInit(false);
    });
};

const canJoin = computed(() => {
  const { gradeLimit = [], departmentLimits = [] } = detailInfo.value;
  const { department, currentGrade } = userStore;
  const gradeAllow =
    !(gradeLimit || []).length || (gradeLimit || []).includes(currentGrade);
  const departmentAllow =
    !(departmentLimits || []).length ||
    (departmentLimits || []).includes(department);
  return gradeAllow && departmentAllow;
});
const courseQuery = computed(() => {
  let result = generateCourseStateConfig({
    state: detailInfo.value.state,
    signUpState: detailInfo.value.signUpstate,
    allowJoin: canJoin.value,
  });
  if (result.label == "进行中" && result.btnText == "无法报名") {
    let currentTime = getTime();
    if (isCollapse(currentTime)) {
      result.btnText = "去报名";
      result.label = "报名中";
      result.disabled = false;
      result.tagColor = "orange";
    }
  }
  if (result.label == "等待教师审核") {
    result.disabled = true;
  }
  return result;
});

const userStore = useUserStore();
const coreInfoConfig = computed(() => {
  const { categoryKey, categoryConfig } = getCategoryConfig(
    detailInfo.value.courseCategory
  );
  const signUpConfig = CourseSignUpStateMap[detailInfo.value.signUpstate];
  let coreInfo = [
    {
      label: "课程状态",
      content: courseStateMap[detailInfo.value.state].label,
      icon: "tabler:status-change",
      iconColor: courseStateMap[detailInfo.value.state].tagColor,
    },
    {
      label: "参与状态",
      content: signUpConfig.signUpLabel,
      icon: "tabler:bell-ringing-filled",
      iconColor: signUpConfig.signUpTagColor,
    },
    {
      label: "分类",
      content: categoryKey,
      icon: "tabler:brand-planetscale",
      iconColor: categoryConfig.tagColor,
    },
    {
      label: "满学分",
      content: detailInfo.value.score || 5,
      icon: "tabler:rosette-discount-check",
      iconColor: "#de820c",
    },
    {
      label: "修读权限",
      content: `${canJoin ? "可修读" : "不可修读"}`,
      icon: `${canJoin.value ? "tabler:zoom-check-filled" : "tabler:zoom-cancel"}`,
      iconColor: `${canJoin ? "#0fd041" : "#6b6b6b"}`,
    },
    {
      label: "人数限制",
      content:
        detailInfo.value.numberLimit == 0
          ? "无限制"
          : detailInfo.value.numberLimit,
      icon: "tabler:password-user",
      iconColor: "#e02121",
    },
    {
      label: "举办方",
      content: detailInfo.value.organizer,
      icon: "tabler:vector-bezier-circle",
      iconColor: "#9e76e2",
    },
    {
      label: "承办方",
      content: detailInfo.value.undertaker,
      icon: "tabler:school",
      iconColor: "#4f75e2",
    },
  ];
  return coreInfo;
});
// 活动时间和报名时间是否重叠
const isCollapse = (currentTime: string) => {
  let beginTime = currentTime;
  let endTime = detailInfo.value.applicationEnd;
  var beginTimes = beginTime.replace(/-/g, "/");
  var endTimes = endTime.replace(/-/g, "/");
  var a = (Date.parse(endTimes) - Date.parse(beginTimes)) / 3600 / 1000;

  if (a < 0) {
    return false;
  } else {
    return true;
  }
};
// 是否显示问卷链接
const isShowLink = () => {
  if (
    courseQuery.value.btnText == `去评价` ||
    courseQuery.value.btnText == `等待教师考评` ||
    courseQuery.value.btnText == `修读完成`
  ) {
    console.log(courseQuery.value.btnText == `修读完成`, 12);

    if (!detailInfo.value.isPatriarch && !detailInfo.value.isOpen) {
      return false;
    }
    return true;
  }
  return false;
};
// 获取当前时间年月日
const getTime = () => {
  var today = new Date();

  // 获取年、月、日、时、分、秒
  var year = today.getFullYear();
  var month = today.getMonth() + 1; // 月份是从 0 开始计数的，需要加1
  var day = today.getDate();
  var hours = today.getHours();
  var minutes = today.getMinutes();
  var seconds = today.getSeconds();

  // 格式化输出
  var formattedTime =
    year +
    "-" +
    (month < 10 ? "0" : "") +
    month +
    "-" +
    (day < 10 ? "0" : "") +
    day +
    " " +
    (hours < 10 ? "0" : "") +
    hours +
    ":" +
    (minutes < 10 ? "0" : "") +
    minutes +
    ":" +
    (seconds < 10 ? "0" : "") +
    seconds;
  return formattedTime;
};
const btnColor = computed(() => {
  return courseQuery.value.disabled
    ? "#b5b3b3"
    : "linear-gradient(to right, #ff6034, #ee0a24)";
});
// 获取家长问卷链接
const getLink = (type: number) => {
  let course = route.query.courseId as string;
  createLinkApi(+course, type).then((res) => {
    if (type == 0) {
      createLink.value = res.data;
    } else {
      createThirdLink.value = res.data;
    }
    showFailToast("tips:链接有效期为15分钟");
  });
};

// 封面图宽高比调优, 避免高度过高
const imgPercent = computed(() => {
  const { width, height } = detailInfo.value.cover;
  const imgRatio = +(width / height).toFixed(1);
  const imgWidthPercent = imgRatio < 0.5 ? "40%" : "100%";
  const imgHeightPercent = imgRatio < 0.5 ? "100%" : "20%";
  return { imgWidthPercent, imgHeightPercent };
});

// 报名
const joinIn = debounce(() => {
  joinCourse(detailInfo.value.id).then(({ success }) => {
    if (success) {
      showSuccessToast("报名成功, 等待审核");
      setTimeout(() => {
        init();
      }, 800);
    }
  });
}, 300);
// 评价
const toComment = () => {
  const dimensionalityInfo = encodeURIComponent(
    JSON.stringify(detailInfo.value.dimensionalityInfo || [])
  );
  router.push({
    path: "/command",
    query: { courseId: detailInfo.value.id, dimensionalityInfo },
  });
};
const submit = () => {
  const { state, signUpstate } = detailInfo.value;
  if (courseQuery.value.disabled) {
    return;
  }

  if (
    [CourseStateEnum.ing, CourseStateEnum.finished].includes(state) &&
    signUpstate === CourseSignUpStateEnum.admitted
  ) {
    setSignVisible(true);
  } else if (signUpstate === CourseSignUpStateEnum.completeSign) {
    toComment();
  } else if (signUpstate === CourseSignUpStateEnum.normal) {
    joinIn();
  }
};

// 签到

const [signVisible, setSignVisible] = useBoolean(false);
const actions = computed<HeaderDefaultAction[]>(() => {
  let actions: HeaderDefaultAction[] = [];
  const { state, signUpstate } = detailInfo.value;
  if (
    signUpstate === CourseSignUpStateEnum.admitted &&
    state >= CourseStateEnum.ing &&
    state !== CourseStateEnum.examining
  ) {
    actions.push({
      icon: "tabler:clock-edit",
      trigger: () => setSignVisible(true),
    });
  }

  return actions;
});

// @ts-ignore
const chartOpts = computed<EChartsOption>(() => {
  const indicator = (detailInfo.value.dimensionalityInfo || []).map(
    ({ name, scale }) => {
      return {
        name,
        scale: scale * 100,
      };
    }
  );
  const names = getSpecificValueIntoArr(indicator, "name");
  const data = getSpecificValueIntoArr(indicator, "scale");

  const range = indicator.map(({ name }) => ({ name, max: 100 }));

  function getData() {
    const res = {
      series: [
        {
          type: "radar",
          symbolSize: 10,
          symbol: "circle",
          areaStyle: {
            color: "#39B2FF",
            opacity: 0.3,
          },
          lineStyle: {
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: "#00A2FF",
                },
                {
                  offset: 1,
                  color: "#0060FF",
                },
              ],
              false
            ),
            width: 2,
          },
          itemStyle: {
            color: "#fff",
            borderColor: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: "#00DEFF",
                },
                {
                  offset: 1,
                  color: "#1598FF",
                },
              ],
              false
            ),
            borderWidth: 2,
            opacity: 1,
          },
          label: {
            show: false,
          },
          data: [
            {
              value: data,
            },
          ],
          z: 100,
        },
      ],
    };

    res.series.map((item, index) => ({
      ...item,
      type: "radar",
      data: [
        {
          value: indicator[index].scale,
        },
      ],
      symbol: "none",
      lineStyle: {
        width: 0,
      },
      itemStyle: {
        color: "#fff",
      },
      areaStyle: {
        color: "#fff",
        shadowColor: "rgba(14,122,191,0.15)",
        shadowBlur: 30,
        shadowOffsetY: 20,
      },
    }));
    return res;
  }
  const optionData = getData();

  const option = {
    backgroundColor: "#fff",
    tooltip: {
      formatter: function () {
        var html = "";
        for (var i = 0; i < indicator.length; i++) {
          html += names[i] + ": " + data[i] + "%<br>";
        }
        return html;
      },
    },
    radar: {
      indicator: range,
      splitArea: {
        show: true,
        areaStyle: {
          color: "#fff",
          shadowColor: "rgba(14,122,191,0.19)",
          shadowBlur: 30,
          shadowOffsetY: 20,
        },
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    series: optionData.series,
  };
  return option;
});

init();
</script>

<template>
  <div class="pageContainer">
    <XdHeader
      title="课程详情"
      :actions="actions"
      :custom-back="() => $router.back()"
    />
    <main v-if="!initLoading">
      <div style="width: 100%; height: max-content">
        <section class="header-info">
          <div class="detail-title">{{ detailInfo.title }}</div>
          <div class="host-time">
            <t-icon class="detail-icon" icon="tabler:clock" />
            <span v-if="detailInfo.hostingStart">
              {{ detailInfo.hostingStart.slice(0, 16) }} ~
              {{ detailInfo.hostingEnd.slice(0, 16) }}
            </span>
          </div>
        </section>
        <van-image
          :src="detailInfo.cover.url"
          :width="imgPercent.imgWidthPercent"
          :height="imgPercent.imgHeightPercent"
          fit="cover"
        >
          <template #loading>
            <van-skeleton-image animate image-size="40" />
          </template>
        </van-image>
        <section class="core-info" id="detail-card-info">
          <span
            ><t-icon
              class="info-title-tag"
              icon="tabler:info-hexagon-filled"
            />重要信息</span
          >
          <div class="core-list">
            <div
              v-for="(info, index) in coreInfoConfig"
              :key="index"
              class="core-card"
            >
              <div class="core-content">
                <span class="core-title">{{ info.label }}</span>
                <span class="core-value">{{ info.content }}</span>
              </div>
              <div
                class="core-tag"
                :style="{
                  backgroundColor: changeColorOpacity(info.iconColor),
                  borderColor: info.iconColor,
                }"
              >
                <t-icon :icon="info.icon" :color="info.iconColor" />
              </div>
            </div>
          </div>
        </section>

        <section class="core-info" style="margin: 30px 0">
          <span
            ><t-icon
              class="info-title-tag"
              icon="tabler:chart-radar"
            />能力维度</span
          >
          <div style="width: 100%; height: auto">
            <DimensionChart width="100%" height="250px" :options="chartOpts" />
          </div>
        </section>

        <div>
          <section class="core-info">
            <span
              ><t-icon
                class="info-title-tag"
                icon="tabler:location-filled"
              />活动地点</span
            >
            <div class="core-text">
              {{ detailInfo.courseLocation }}
            </div>
          </section>
          <section class="core-info">
            <span
              ><t-icon
                class="info-title-tag"
                icon="tabler:clock"
              />报名时间</span
            >
            <div class="core-text">
              {{ detailInfo.applicationStart.slice(0, 16) }} ~
              {{ detailInfo.applicationEnd.slice(0, 16) }}
            </div>
          </section>
          <section class="core-info">
            <span
              ><t-icon
                class="info-title-tag"
                icon="tabler:brand-messenger"
              />联系方式</span
            >
            <div class="core-text">
              {{ detailInfo.contact || "暂无" }}
            </div>
          </section>
          <section class="core-info">
            <span
              ><t-icon
                class="info-title-tag"
                icon="tabler:building-community"
              />学院限制</span
            >
            <div class="core-text">
              {{
                (detailInfo.departmentLimits || []).length
                  ? [...new Set(detailInfo.departmentLimits)].join("、")
                  : "全校"
              }}
            </div>
          </section>
          <section class="core-info">
            <span
              ><t-icon
                class="info-title-tag"
                icon="tabler:user-check"
              />年级限制</span
            >
            <div class="core-text">
              {{
                (detailInfo.gradeLimit || []).length
                  ? [...new Set(detailInfo.gradeLimit)].join("、")
                  : "全年级"
              }}
            </div>
          </section>
          <section class="core-info">
            <span
              ><t-icon
                class="info-title-tag"
                icon="tabler:coins"
              />学分获取规则</span
            >
            <div class="core-text">
              {{ detailInfo.scoringStandards }}
            </div>
          </section>
          <section class="core-info">
            <span
              ><t-icon
                class="info-title-tag"
                icon="tabler:coins"
              />积分产出规则</span
            >
            <div class="core-text">
              {{ detailInfo.pointsRules }}
            </div>
          </section>
          <section v-if="detailInfo.introduction" class="detail-extra-info">
            <span
              ><t-icon
                class="info-title-tag"
                icon="tabler:affiliate-filled"
              />附加信息</span
            >
            <article>
              {{ detailInfo.introduction }}
            </article>
          </section>
          <section class="core-info" v-if="isShowLink()">
            <span
              ><t-icon
                class="info-title-tag"
                icon="fluent:share-16-filled"
              />问卷链接</span
            >
            <div class="core-text">
              <van-button v-if="detailInfo.isPatriarch" @click="getLink(0)"
                >点击生成家长链接</van-button
              ><br />
              <div class="link" v-if="createLink.length">{{ createLink }}</div>
              <van-button v-if="detailInfo.isOpen" @click="getLink(1)"
                >点击生成第三方链接</van-button
              >
              <div class="link" v-if="createThirdLink">
                {{ createThirdLink }}
              </div>
            </div>
          </section>
        </div>
        <div class="detail-footer"></div>
      </div>
    </main>
    <div
      v-if="!initLoading"
      class="detail-btn"
      @click="submit"
      :style="{
        background: btnColor,
      }"
    >
      {{ courseQuery.btnText }}
    </div>
    <SignComp
      :visible="signVisible"
      :course-id="detailInfo.id || (route.query.courseId as string)"
      :user-department-id="userStore.departmentId"
      @on-close="() => setSignVisible(false)"
      @on-success="toComment"
    />
    <XdLoading :visible="initLoading" />
    <RefreshBall :loading="initLoading" :trigger="init" need-rotate />
  </div>
</template>

<style scoped lang="less">
main {
  overflow-x: hidden;
  background-color: white;
  overflow-y: scroll;
  section {
    border-radius: 15px;
  }
  .header-info {
    .flex-column-start;
    padding: 15px;
    width: calc(100% - 30px);
    margin: 10px auto 15px;
    align-items: flex-start;
    div {
      margin-top: 10px;
    }
    .detail-title {
      font-size: 55px;
      font-weight: bolder;
      color: black;
    }
    .host-time {
      display: flex;
      align-items: center;
      span {
        color: rgb(226, 105, 6);
      }
    }
  }
  .core {
    &-info {
      width: 100%;
      margin-top: 25px;
      text-align: left;
      background-color: transparent;
      & > span {
        display: flex;
        align-items: center;
        font-size: 30px;
        letter-spacing: 2px;
        margin: 15px 0;
        font-weight: 800;
        .info-title-tag {
          margin-right: 10px;
        }
      }
      .detail-dimension-chart {
        width: 100%;
        height: 600px;
      }
    }
    &-list {
      width: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    &-card {
      width: 49%;
      height: 120px;
      background-color: white;
      border-radius: 15px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      .card-shadow;
    }
    &-content {
      padding: 20px;
      width: calc(76% - 40px);
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-around;
      .core-title {
        color: rgb(82, 82, 82);
        font-size: 28px;
        font-weight: bold;
      }
      .core-value {
        font-size: 23px;
        font-weight: bold;
        color: rgb(113, 113, 113);
      }
    }
    &-tag {
      flex: 1;
      font-size: 40px;
      border-radius: 50%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: scale(0.8);
      border: 2px solid transparent;
    }
    &-text {
      width: 90%;
      margin: 0 auto;
      .link {
        width: 90%;
        padding: 2px;
        border: dotted 1px black;
        word-wrap: break-word;
      }
    }
  }
}

:deep(.van-image__img) {
  border-radius: 20px;
}
.detail {
  &-icon {
    margin-right: 5px;
  }
  &-footer {
    width: 100%;
    height: 300px;
  }
  &-btn {
    .card-shadow;
    position: fixed;
    bottom: 20px;
    padding: 20px 180px;
    border-radius: 15px;
    color: white;
  }
  &-extra-info {
    margin: 50px auto 0;
    padding: 20px;
    width: calc(90% - 40px);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 15px;
    background-color: rgb(240, 240, 240);
    .card-shadow;
    span {
      color: rgb(97, 97, 97);
      font-weight: bolder;
      .info-title-tag {
        margin-right: 10px;
      }
    }
    article {
      margin-top: 15px;
      text-indent: 2em;
      color: rgb(146, 146, 146);
      text-align: left;
    }
  }
}
</style>
