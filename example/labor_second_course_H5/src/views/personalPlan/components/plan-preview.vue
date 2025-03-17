<script setup lang="ts">
import type { PlanItem } from "@/api/types/user";
import { PlanStateMap } from "./config";
import { BaseProgressNode } from "@/components/progressBar/types";
import { completePlanAPI } from "@/api/plan";
import { PointTypeEnum } from "@/api/types/user";
import { useUserStore } from "@/store/modules/user";
import { showFailToast } from "vant";

const userStore = useUserStore();
const PointProgressBar = defineAsyncComponent(
  () => import("@/components/progressBar/index.vue")
);
const props = defineProps<{
  plan: PlanItem;
}>();

const pointStageNodes = computed<BaseProgressNode[]>(() => {
  const { limitScore, targetScore } = props.plan;
  const nodes: BaseProgressNode[] = [
    {
      //   thresholdStep: props.plan.limitScore || 20,
      thresholdStep: props.plan.targetScore || 20,
      icon: "tabler:coins",
      tip: "+20",
      progressLength: "70px",
    },
  ];

  if (limitScore === targetScore) {
    const extraPoint = 20;
    nodes.push({
      thresholdStep: props.plan.targetScore,
      icon: "tabler:coins",
      tip: `${extraPoint}`,
      progressLength: "70px",
    });
  }

  return nodes;
});

watch(
  () => props.plan.progressScore,
  (newVal) => {
    if (newVal == props.plan.targetScore) {
      const plan = {
        id: props.plan.id,
        departmentId: +userStore.departmentId,
        type: PointTypeEnum.completeSelfPlan,
        origin: "完成目标",
      };
      completePlanAPI(plan).catch(() => {
        showFailToast({
          message: "网络异常, 目标失败, 请稍后再试",
          duration: 2 * 1000,
        });
      });
    }
  }
);
</script>

<template>
  <div class="plan-preview-container">
    <section>
      <div class="plan-base-info">
        <span class="plan-name">{{ plan.objectivesName }}</span>
        <!--不直接v-for是为了适应以后可能每一项会有的新UI-->
        <ul class="plan-limit">
          <!-- <li>
            <span class="plan-info-label">课程分类: </span>
            <span>{{ props.plan.type }}</span>
          </li> -->
          <li>
            <span class="plan-info-label">最低要求学分: </span>
            <span>{{ props.plan.minRequirement }}</span>
          </li>
          <li>
            <span class="plan-info-label">个人目标学分: </span>
            <span>{{ props.plan.targetScore }}</span>
          </li>
          <li>
            <span class="plan-info-label">当前获得学分: </span>
            <span>{{ props.plan.progressScore }}</span>
          </li>
          <!-- <li>
            <span class="plan-info-label">所属学年: </span>
            <span>{{ props.plan.affiliationGrade }}</span>
          </li> -->
          <!-- <li>
            <span class="plan-info-label">生效周期: </span>
            <span
              >{{ (props.plan.start as String).slice(0, 10) }} ~
              {{ (props.plan.end as String).slice(0, 10) }}</span
            >
          </li> -->
        </ul>
        <div class="plan-progress-bar"></div>
      </div>
      <div class="plan-state">
        <t-icon
          class="plan-state-icon"
          :icon="PlanStateMap[plan.state].icon"
          :color="PlanStateMap[plan.state].color"
        />
        <span>{{ PlanStateMap[plan.state].label }}</span>
      </div>
    </section>
    <section class="plan-progress-bar-container">
      <!--积分获取进度条-->
      <PointProgressBar
        :total-steps="props.plan.targetScore"
        :current-step="props.plan.progressScore"
        :nodes="pointStageNodes"
      />
    </section>
  </div>
</template>

<style scoped lang="less">
.plan-preview-container {
  margin: 20px auto;
  width: 92%;
  min-height: 250px;
  padding: 20px 0;
  border-radius: 15px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  section {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .plan-base-info {
    flex: 1;
    padding-left: 30px;
    height: max-content;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-around;
    .plan-name {
      width: 100%;
      margin-bottom: 10px;
      text-overflow: ellipsis;
      text-align: left;
      font-size: 40px;
      font-weight: 900;
      color: black;
    }
    .plan-limit {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .plan-info-label {
        color: rgb(51, 51, 51);
      }
    }
  }
  .plan-state {
    width: 20%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-direction: column;
    .plan-state-icon {
      font-size: 100px;
    }
    span {
      font-size: 24px;
    }
  }
  .plan-progress-bar-container {
    margin-top: 20px;
    height: auto;
  }
}
</style>
