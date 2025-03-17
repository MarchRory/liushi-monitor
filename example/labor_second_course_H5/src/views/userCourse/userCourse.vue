<template>
  <div class="my-courses-container">
    <XdHeader />
    <XdHeader title="我的课程"
      ><template #left>
        <t-icon
          class="category-controller"
          icon="tabler:category"
          @click="menuVisible = true"
        /> </template
    ></XdHeader>
    <van-dropdown-menu active-color="#e1562a">
      <van-dropdown-item v-model="state" :options="option" />
    </van-dropdown-menu>
    <div class="list-container">
      <UserCourseWaterFall
        :request-api="getCourses"
        :other-request-params="otherParams"
      />
    </div>
  </div>
  <van-popup
    v-model:show="menuVisible"
    position="left"
    transition-appear
    safe-area-inset-top
    safe-area-inset-bottom
    duration="0.2"
    round
    :style="{
      width: '75%',
      height: '100%',
    }"
  >
    <div class="menu-container">
      <div class="menu-list">
        <div class="menu-card">
          <div class="menu-card-title">
            <t-icon icon="tabler:brand-linktree" />课程类别
          </div>
          <div class="menu-card-options">
            <div
              v-for="(category, key, index) in CourseCategoryMap"
              :key="index"
              class="menu-option-item"
              @click="chooseCategory(category['value'])"
              :class="{
                'menu-active-option': params.category == category['value'],
              }"
            >
              {{ key }}
            </div>
          </div>
        </div>
      </div>
      <div class="menu-btn-group">
        <div class="quit-btn" @click="quit">取消</div>
        <div class="filter-btn" @click="filter">筛选</div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { getCourses } from "@/api/courses/courses";
import {
  CourseCategoryMap,
  CourseCategoryType,
  CourseStateEnum,
  courseStateMap,
} from "@/api/types/public";
import { HomeSearchParams } from "@/views/home/components/types";

defineOptions({
  name: "userCourse",
});

const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);
const UserCourseWaterFall = defineAsyncComponent(
  () => import("@/components/waterFall/index.vue")
);
const option = Object.entries(courseStateMap).map(
  ([value, { label: text }]) => ({ text, value: +value })
);
const state = ref(CourseStateEnum.all);
const menuVisible = ref<boolean>(false);

const params = ref<HomeSearchParams>({
  category: "",
  state: 0,
});

const otherParams = ref({
  userType: 1,
  state: state.value,
  passType: state.value >= 3 ? 1 : null,
  category: "",
});

const chooseCategory = (newCateGory: CourseCategoryType) => {
  params.value.category = newCateGory;
};

// 退出按钮
const quit = () => {
  menuVisible.value = false;
};

// 筛选按钮
const filter = () => {
  const { category } = params.value;
  otherParams.value.category = category;
  menuVisible.value = false;
};

watch(
  () => state.value,
  (newVal) => {
    otherParams.value.state = newVal;
    otherParams.value.passType = newVal >= 3 ? 1 : null;
  }
);
</script>

<style scoped lang="less">
.my-courses-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  .list-container {
    width: 96%;
    padding-top: 10px;
    flex: 1;
    overflow-y: auto;
  }
}
.menu-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-x: hidden;
  .menu-list {
    width: 100%;
    padding-top: 50px;
    flex: 1;
    overflow-y: auto;
    .menu-card {
      width: calc(100% - 40px);
      padding: 30px 20px;
      height: max-content;
      .menu-card-title {
        width: 100%;
        text-align: left;
        font-size: 30px;
        font-weight: 700;
        margin-bottom: 25px;
      }
      .menu-card-options {
        width: calc(100% - 40px);
        margin: 0 auto;
        height: max-content;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;
        .menu-option-item {
          width: 30%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background-color: rgb(242, 242, 242);
          color: rgb(41, 41, 41);
          border-radius: 20px;
          margin-bottom: 20px;
          margin-right: 15px;
          color: 15px;
        }
        .menu-active-option {
          color: white;
          background-color: #ffb555;
        }
      }
    }
    .split-line {
      width: 100%;
      height: 15px;
      background-color: rgb(240, 240, 240);
    }
  }
  .menu-btn-group {
    margin: 0 auto;
    width: 86%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    & > div {
      padding: 10px 60px;
      font-size: 30px;
      font-weight: bold;
      letter-spacing: 5px;
      border: 4px solid;
    }
    & > .quit-btn {
      border-top-left-radius: 0;
      border-bottom-left-radius: 30px;
      border-color: #fa9e25;
      color: #fa9e25;
    }
    & > .filter-btn {
      border-top-right-radius: 0;
      border-bottom-right-radius: 30px;
      border-color: transparent;
      background-color: #fa9e25;
      color: white;
    }
  }
}
:deep(.van-dropdown-menu__bar) {
  width: 100vw;
  height: calc(var(--van-dropdown-menu-height) * 0.7);
  background-color: white;
}
:deep(.van-dropdown-item__option) {
  padding: 15px 30px;
}
</style>
