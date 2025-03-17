<template>
  <div class="honorMedal-contain">
    <div class="top-bar">
      <span class="title"
        >荣誉勋章<t-icon
          style="margin-left: 5px"
          icon="solar:medal-star-linear"
      /></span>
      <button
        v-if="groupUpbadeges.length > 4"
        class="moreBtn"
        @click="toMedalTitle"
      >
        更多>
      </button>
      <button v-else class="moreBtn" @click="toMedalTitle">前往></button>
    </div>
    <section class="badge-list-container">
      <div
        v-for="(badge, index) in groupUpbadeges.slice(0, 4)"
        class="badge-list-item"
        :key="index"
      >
        <div class="badge-cover">
          <t-icon
            v-if="!badge.imgSrc && badge.isGain == true"
            :icon="badge.icon"
            class="badge-icon"
            :style="{
              color: badge.activeColor,
            }"
          />
        </div>
        <div class="badge-label">
          <div class="badge-name" v-if="!badge.imgSrc && badge.isGain == true">
            {{ badge.name }}
          </div>
          <div class="badge-condition">{{ badge.condition }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { usePointStore } from "@/store/modules/point";
import { useFlagStore } from "@/store/modules/flag";
import { useMailStore } from "@/store/modules/mail";
import { storeToRefs } from "pinia";
import { badgeItem, tempBadgeList } from "@/views/honoraryTitle/config";

interface Props {
  title: string;
  badges?: badgeItem[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "荣誉列表",
  badges: () => tempBadgeList,
});

const router = useRouter();
const pointStore = usePointStore();
const flagStore = useFlagStore();
const mailStore = useMailStore();
const { pointTotal } = storeToRefs(pointStore);
const { flagFromCourse } = storeToRefs(flagStore);
const { mailTotal } = storeToRefs(mailStore);

const groupUpbadeges = computed(() => {
  let arr = props.badges.map((item) => {
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
  return arr.filter((item) => item.isGain == true);
});

const toMedalTitle = () => {
  router.push({ path: "/honoraryTitle" });
};
</script>

<style lang="less" scoped>
.honorMedal-contain {
  margin: 20px 0;
  background-color: white;
  box-shadow: 0px 0px 16px -5px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  padding: 15px 30px;
  width: calc(100% - 60px);
  height: max-content;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  .top-bar {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 30px;
    .title {
      width: fit-content;
      font-weight: 600;
      font-size: 1.1em;
      display: flex;
      align-items: center;
    }
    .moreBtn {
      width: fit-content;
      padding: 0px;
      height: 1.2em;
      border: none;
      background-color: transparent;
      color: gray;
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
      width: 25%;
      .badge-cover {
        display: flex;
        align-items: center;
        justify-content: center;
        .badge-icon {
          font-size: 130px;
        }
      }
      .badge-label {
        .badge-name {
          font-size: 30px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .badge-condition {
          font-size: 20px;
          color: #9d9d9d;
        }
      }
    }
  }
}
</style>
