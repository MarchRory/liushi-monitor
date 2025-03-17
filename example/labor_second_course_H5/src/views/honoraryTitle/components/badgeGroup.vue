<script setup lang="ts">
import { storeToRefs } from "pinia";
import { badgeItem, tempBadgeList } from "../config";
import { usePointStore } from "@/store/modules/point";
import { useFlagStore } from "@/store/modules/flag";
import { useMailStore } from "@/store/modules/mail";
interface Props {
  title: string;
  badges?: badgeItem[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "荣誉列表",
  badges: () => tempBadgeList,
});
const BadgeItem = defineAsyncComponent(() => import("./badgeItem.vue"));

const pointStore = usePointStore();
const flagStore = useFlagStore();
const mailStore = useMailStore();
const { pointTotal } = storeToRefs(pointStore);
const { flagFromCourse } = storeToRefs(flagStore);
const { mailTotal } = storeToRefs(mailStore);

// 成长系列的荣誉称号
const groupUpbadeges = computed(() => {
  return props.badges.map((item) => {
    if (item.type == "积分") {
      return {
        ...item,
        isGain: pointTotal.value >= item.minPoint,
      };
    } else if (item.type == "Flag") {
      return {
        ...item,
        isGain: flagFromCourse.value >= item.minPoint,
      };
    } else {
      return {
        ...item,
        isGain: mailTotal.value >= item.minPoint,
      };
    }
  });
});
</script>

<template>
  <div class="badge-group-container">
    <slot name="group-title">
      <div class="badge-group-title">
        <div class="line left-line"></div>
        <strong>{{ props.title }}</strong>
        <div class="line right-line"></div>
      </div>
    </slot>
    <section class="badge-list-container">
      <div
        v-for="(badge, index) in groupUpbadeges"
        :key="index"
        class="badge-list-item"
      >
        <BadgeItem :badge="badge" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.badge-group-container {
  padding: 30px 20px 0px 20px;
  .badge-group-title {
    width: max-content;
    margin: 0 auto;
    margin-top: 20px;
    font-size: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .line {
      width: 100px;
      height: 6px;
    }
    .left-line {
      background: linear-gradient(to left, #de4d22, transparent);
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
      margin-right: 20px;
    }
    .right-line {
      background: linear-gradient(to right, #de4d22, transparent);
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
      margin-left: 20px;
    }
  }

  .badge-list-container {
    width: 100%;
    height: auto;
    padding: 30px 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;

    .badge-list-item {
      width: 33.3%;
    }
  }
}
</style>
