<script setup lang="ts">
import { coursesItem } from "@/api/types/courses";
import { getCategoryConfig } from "@/utils/course";
import { useUserStore } from "@/store/modules/user";
import { generateCourseStateConfig } from "@/utils/course";
import { useRouter } from "vue-router";
import defaultCover from "@/assets/imgs/default-cover.jpg";
import { registerMethodsLog } from "@/utils/logger/hooks";

/**
 * @description 瀑布流默认卡片, 样式在这里调整
 */
const props = defineProps<{
  course: coursesItem;
}>();

const userStore = useUserStore();
const { categoryKey, categoryConfig } = getCategoryConfig(
  props.course.courseCategory
);
const hasPermission = computed(() => {
  const { gradeLimit = [], departmentLimits = [] } = props.course;
  const { department, currentGrade } = userStore;
  const gradeAllow = !gradeLimit.length || gradeLimit.includes(currentGrade);
  const departmentAllow =
    !departmentLimits.length || departmentLimits.includes(department);
  return gradeAllow && departmentAllow;
});
const previewConfig = generateCourseStateConfig({
  state: props.course.state,
  signUpState: props.course.signUpstate!,
  allowJoin: hasPermission.value,
});

const router = useRouter();
const pageToDetail = () => {
  router.push({
    path: "/detail",
    // @ts-ignore
    query: {
      courseId: props.course.id,
    },
  });
};

const { pageToDetailLogged } = registerMethodsLog({ pageToDetail });
</script>

<template>
  <div class="course-default-card" @click="pageToDetailLogged">
    <van-image
      :src="course.cover.url || defaultCover"
      height="80%"
      fit="cover"
      lazy-load
      class="course-default-cover"
    >
      <template #loading>
        <van-skeleton-image animate image-size="40" />
      </template>
    </van-image>
    <!--预览卡片的UI就相信后人的智慧了-->
    <div class="course-default-info">
      <div class="course-default-info-title">{{ props.course.title }}</div>
      <div class="course-default-info-category">
        <span
          class="course-default-tag category-tag"
          :style="{
            color: categoryConfig.tagColor,
          }"
        >
          <t-icon class="category-icon" icon="tabler:brand-planetscale" />
          {{ categoryKey }}
        </span>
        <div class="">
          <t-icon class="category-icon" icon="tabler:building-community" />
          {{
            props.course.departmentLimits[0]
              ? props.course.departmentLimits[0]
              : "全校"
          }}{{ props.course.departmentLimits.length > 1 ? "..." : "" }}
        </div>
      </div>
      <div class="course-default-info-back">
        <span
          ><t-icon class="category-icon" icon="tabler:tie" />{{
            props.course.organizer || "未填写举办方"
          }}</span
        >
        <span>名额 {{ props.course.numberLimit }}</span>
      </div>
    </div>
    <!--图片上的遮罩, 用于放置各种tag信息-->
    <div class="course-default-mask">
      <div class="mask-header">
        <span
          class="course-default-tag state-tag"
          :style="{
            backgroundColor: previewConfig.tagColor,
          }"
          >{{ previewConfig.label }}</span
        >
        <span class="course-default-tag allow-tag" v-if="hasPermission">
          可修读
        </span>
      </div>
      <div class="mask-footer">
        <span></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.course-default {
  &-card {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-around;
    width: 100%;
    height: 100%;
    transition: all 0.2s ease;
    animation: fadeMove 0.2s;
  }
  &-info {
    flex: 1;
    width: 98%;
    margin: 0 auto;
    display: flex;
    text-align: left;
    align-items: center;
    flex-direction: column;
    justify-content: space-around;
    div {
      width: 100%;
      text-overflow: ellipsis;
      text-align: left;
    }
    &-title {
      font-size: 28px;
      font-weight: bold;
    }
    &-category {
      font-size: 16px;
      font-weight: bold;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      text-align: left;
      div {
        width: max-content;
      }
    }
    &-back {
      font-size: 20px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }
  &-mask {
    position: absolute;
    top: 0;
    width: 100%;
    height: 76%;
    margin-top: 3%;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    .mask-header,
    .mask-footer {
      width: 94%;
      margin: 0 auto;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .mask-footer {
    }
  }
  &-tag {
    font-size: 20px;
    padding: 2px 10px;
    border-radius: 5px;
    color: white;
  }
}

.category-tag {
  display: flex;
  align-items: center;
  padding-left: 0;
  font-weight: bold;
}
.category-icon {
  margin-right: 5px;
}
.allow-tag {
  color: rgb(70, 70, 70);
  background-color: white;
}

:deep(.van-image__img) {
  border-radius: 15px !important;
}

@keyframes fadeMove {
  from {
    opacity: 0;
    transform: translateY(5%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
