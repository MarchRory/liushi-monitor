<script setup lang="ts">
/**
 * @description 虚拟列表瀑布流组件, 本项目中默认给课程列表使用, 但也留有自定义插槽
 */
import { WaterFallListProps } from "./types";
import useWaterFallFeed from "./hooks/useWaterFall";
const DefaultCourseCard = defineAsyncComponent(
  () => import("./components/CardItem.vue")
);
const XdLoading = defineAsyncComponent(
  () => import("@/components/loading/index.vue")
);
const RefreshBall = defineAsyncComponent(
  () => import("@/components/suspension/ball.vue")
);
const props = withDefaults(defineProps<WaterFallListProps>(), {
  column: 2,
  gap: 10,
  pageSize: 30,
});
const emits = defineEmits<{
  (e: "onScroll", scrollTop: number): void;
}>();

const waterfall = ref<HTMLDivElement | null>(null);
const {
  loading,
  curPage,
  listData,
  endIndex,
  renderedListStyle,
  totalLength,
  isFinish,
  renderedList,
  handleScroll,
  reload,
} = useWaterFallFeed(waterfall, props);

// 滚动到指定位置
const waterFallScrollTo = (scrollTop: number) => {
  waterfall.value?.scrollTo({
    top: scrollTop,
  });
};

const scrollTrigger = () => {
  handleScroll();
  emits("onScroll", waterfall.value?.scrollTop || 0);
};

// 外界可以通过拿到组件的DOM, 调用暴露出去的方法
defineExpose({
  waterFallScrollTo,
});
</script>

<template>
  <div class="virtual-waterfallfeed-comp-wapper">
    <div
      ref="waterfall"
      class="virtual-waterfallfeed-container"
      @scroll.stop="scrollTrigger"
    >
      <div class="virtual-waterfallfeed-list">
        <div
          v-if="renderedList.length"
          v-for="({ item, style }, index) in renderedList"
          :style="style"
          :key="item.id"
          class="virtual-waterfallfeed-item"
        >
          <slot name="item" :item="item" :index="index">
            <!--默认渲染课程列表-->
            <!--@vue-ignore-->
            <DefaultCourseCard :course="item" />
          </slot>
        </div>
        <van-empty
          v-else
          image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
          image-size="80"
          description="暂无数据噢"
        />
      </div>
    </div>
    <XdLoading :visible="loading" />
    <RefreshBall :trigger="reload" need-rotate :loading="loading" />
  </div>
</template>

<style scoped lang="less">
.virtual-waterfallfeed-comp-wapper {
  height: 100%;
  width: 100%;
}
.virtual-waterfallfeed {
  &-container {
    height: 100%;
    width: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  &-list {
    position: relative;
    width: 100%;
  }
  &-item {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    border-radius: 15px;
    overflow: hidden;
  }
}
</style>
