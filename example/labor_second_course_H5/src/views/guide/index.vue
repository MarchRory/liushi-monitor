<template>
  <div class="container">
    <van-swipe class="swipe" :loop="false" :touchable="false" ref="swipe">
      <van-swipe-item
        ><guidePageOne @onChange="onChange"></guidePageOne
      ></van-swipe-item>
      <van-swipe-item v-show="show1"
        ><guidePageTwo @onChange="onChange"></guidePageTwo
      ></van-swipe-item>
      <van-swipe-item v-show="show2"
        ><guidePageThree @onChange="onChange"></guidePageThree
      ></van-swipe-item>
      <van-swipe-item v-show="show3"
        ><guidePageFour @onChange="onChange"></guidePageFour
      ></van-swipe-item>
      <van-swipe-item v-show="show4"
        ><guidePageFive></guidePageFive
      ></van-swipe-item>
      <template #indicator="{ active, total }">
        <div class="custom-indicator">{{ active + 1 }}/{{ total }}</div>
      </template>
    </van-swipe>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from "vue";

const instance = getCurrentInstance();

const guidePageOne = defineAsyncComponent(
  () => import("./children/guidePageOne.vue")
);
const guidePageTwo = defineAsyncComponent(
  () => import("./children/guidePageTwo.vue")
);
const guidePageThree = defineAsyncComponent(
  () => import("./children/guidePageThree.vue")
);

const guidePageFour = defineAsyncComponent(
  () => import("./children/guidePageFour.vue")
);
const guidePageFive = defineAsyncComponent(
  () => import("./children/guidePageFive.vue")
);

// 除首页外动画渲染
const show1 = ref(false);
const show2 = ref(false);
const show3 = ref(false);
const show4 = ref(false);

const onChange = () => {
  const swipeRef: any = instance?.refs.swipe;
  if (!show1.value) {
    show1.value = true;
  } else {
    if (!show2.value) {
      show2.value = true;
    } else {
      if (!show3.value) {
        show3.value = true;
      } else {
        show4.value = true;
      }
    }
  }
  swipeRef.next();
};
</script>

<style scoped lang="less">
.container {
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  .swipe {
    width: 100%;
  }
}
</style>
