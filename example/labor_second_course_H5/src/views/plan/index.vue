<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/modules/user";
import {
  getToCreatePlanList,
  completePlanAPI,
  getPlanListAPI,
} from "@/api/plan";
import type { ToCreatePlanItem, PlanItem } from "@/api/types/user";
import { ObtainedScore } from "@/api/types/public";
import { BaseProgressNode } from "@/components/progressBar/types";

const PointGetProgressBar = defineAsyncComponent(
  () => import("./components/progressBar.vue")
);
const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);

defineOptions({
  name: "plan",
});

// 可创建的计划名单
const planListData = ref<ToCreatePlanItem[]>([]);
// 个人计划的list
const userPlanList = ref<PlanItem[]>([]);
const router = useRouter();
const isLoad = ref(false);
const skeletonLoad = ref(false);
const courseSke = defineAsyncComponent(
  () => import("@/components/coursePageSkeleton/coursePageSkeleton.vue")
);
const reLoad = ref(false);
const userStore = useUserStore();
const { cateGoryScore, currentGrade, obtainedScore } = storeToRefs(userStore);

const pointStageNodes = (obj: ObtainedScore) => {
  // const { limitScore, targetScore } = props.plan;
  const plan = planListData.value.filter((item) => item.type == obj.name);
  const score = userPlanList.value.filter((item) => item.type == obj.name);
  const nodes: BaseProgressNode[] = [];
  if (score.length) {
    // 个人计划里有
    nodes.push({
      //push个人计划里的最小要求分数
      thresholdStep: score[0].minRequirement,
      icon: "mdi:barley",
      tip: `${score[0].minRequirement}分`,
    });
    nodes.push({
      //push个人计划自己设定的分数
      thresholdStep: score[0].targetScore,
      icon: "uil:flower",
      tip: `${score[0].targetScore}分`,
    });
  } else {
    //个人计划里没有的活动类别
    if (plan.length) {
      //如有教师新增计划，push教师计划的分数
      nodes.push({
        thresholdStep: plan[0].fixRestrictions,
        icon: "mdi:barley",
        tip: `${plan[0].fixRestrictions}分`,
      });
    } else {
      //教师没有计划，个人计划也没有的活动类别，push默认分数
      nodes.push({
        thresholdStep: 12,
        icon: "mdi:barley",
        tip: `12分`,
      });
    }
  }

  return nodes;
};

const refresh = () => {
  reLoad.value = true;
  (async () => {
    userStore.updateCateGoryScore();
  })().finally(() => {
    reLoad.value = false;
  });
};

const loadPlanList = () => {
  getToCreatePlanList().then(({ data }) => {
    planListData.value = data.filter(
      (item) => item.grade == currentGrade.value
    );
  });
};

const loadUserPlanList = () => {
  const obj = {
    pageNum: 1,
    pageSize: 10,
    grade: currentGrade.value,
  };
  getPlanListAPI(obj).then((res) => {
    if (res.code == 200) {
      userPlanList.value = res.data.list;
    }
  });
};

// 进度条总分，有计划以计划分数为准
const highestScore = (name: string) => {
  if (cateGoryScore.value) {
    let score = cateGoryScore.value.filter((item) => item.type == name);
    if (score.length) {
      return score[0].targetScore;
    }
  }
  const lowScore = planListData.value.filter((item) => item.type == name);
  if (lowScore.length) {
    return lowScore[0].fixRestrictions;
  }
  return 12;
};

const tagIcon = [
  "arcticons:cache-cleaner",
  "game-icons:spell-book",
  "guidance:service-animal-1",
  "healthicons:agriculture-worker-outline",
  "eos-icons:products-outlined",
  "hugeicons:house-03",
];

const toCreatePlan = (obj: ObtainedScore) => {
  let objInfo = planListData.value.filter((item) => item.type == obj.name);
  if (objInfo.length) {
    let plan: ToCreatePlanItem = JSON.parse(JSON.stringify(objInfo[0]));
    // 检查计划的目标分数是否大于当前修读目标
    if (plan.fixRestrictions > obj.value) {
      router.push({ path: "/createPlanForm", query: plan });
    } else {
      alert(`设置的目标分数(${plan.fixRestrictions}分)需要大于当前的修读目标(${obj.value}分)噢！`);
    }
  }
};

const isPlan = (obj: ObtainedScore) => {
  let objInfo = planListData.value.filter((item) => item.type == obj.name);
  if (objInfo.length) return true;
  return false;
};

loadPlanList();
loadUserPlanList();
onMounted(() => {
  $liushiMonitor.sendSpaLoadPerformance()
})
</script>

<template>
  <course-ske :ske-load="skeletonLoad"></course-ske>
  <div class="container">
    <XdHeader title="学分进度" hiden-back />
    <van-pull-refresh v-model="reLoad" @refresh="refresh">
      <div v-if="!skeletonLoad" class="container" @touchmove.stop>
        <van-loading color="#1989fa" v-if="isLoad" />
        <div
          class="list"
          v-if="!isLoad && obtainedScore && obtainedScore.length"
        >
          <div
            class="object"
            v-for="(obj, index) in obtainedScore"
            :key="index"
          >
            <div class="seat">
              <t-icon :icon="tagIcon[index]" class="category-icon" />
            </div>
            <div class="ObjInfo">
              <div class="name">
                {{ obj.name }}
                <div class="currentScore">
                  <van-tag plain type="primary" color="#feba07"
                    >当前:{{ obj.value }}分</van-tag
                  >
                </div>
              </div>

              <div class="bar">
                <PointGetProgressBar
                  :total-steps="highestScore(obj.name)"
                  :current-step="
                    obj.value > highestScore(obj.name)
                      ? highestScore(obj.name)
                      : obj.value
                  "
                  :nodes="pointStageNodes(obj)"
                ></PointGetProgressBar>
              </div>
            </div>
            <div class="createPlan">
              <!-- 跳转到personalPlan的createPlan里 -->
              <van-button
                v-if="isPlan(obj)"
                color="#1dd7b8"
                type="warning"
                size="small"
                plain
                @click="toCreatePlan(obj)"
                >+计划</van-button
              >
            </div>
          </div>
          <div class="tips">
            图案是
            <t-icon class="node-icon" icon="uil:flower" />代表个人计划分数<br />
            图案是
            <t-icon class="node-icon" icon="mdi:barley" />代表学校的最低目标
          </div>
        </div>
        <van-empty v-else description="数据暂未生成" />
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped lang="less">
@objInfoWidth: 400px;

.container {
  width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: rgb(245, 246, 248);
  flex: 1;

  .list {
    padding: 20px;
    //overflow-y: auto;
    padding-bottom: 50px;

    .object {
      width: 660px;
      height: 200px;
      border-radius: 10px;
      margin-top: 18px;
      //border: 1px solid #cdcdcd;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      margin-top: 20px;
      padding-right: 30px;
      background-color: white;
      box-shadow: 0 0 15px rgba(1, 1, 1, 0.15);
      .createPlan {
        height: 100%;
        width: fit-content;
        display: flex;
        align-items: flex-start;
        :deep(.van-button) {
          position: relative;
          left: 15px;
          top: 5%;
          height: 45px;
        }
      }
      .seat {
        height: 100%;
        width: calc(560px - @objInfoWidth);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ObjInfo {
        width: @objInfoWidth;
        display: flex;
        justify-content: center;
        flex-direction: column;
        height: 100%;
        .name {
          font-family: Gen Jyuu Gothic;
          font-size: 30px;
          font-weight: 300;
          // line-height: 20px;
          letter-spacing: 3px;
          text-align: left;
          // margin-bottom: 2vw;
          .currentScore {
            position: relative;
            left: 0%;
            bottom: 3%;
            display: inline-block;
            width: fit-content;
          }
        }

        .bar {
          width: 100%;
          height: 60%;
          // background-color: blue;
        }
        // :deep(.van-progress) {
        //   height: 22px;
        // }
      }
    }
    .tips {
      margin-top: 10px;
      color: gray;
    }
  }
}
.category-icon {
  font-size: 140px;
  color: #1dd7b8;
}
</style>
