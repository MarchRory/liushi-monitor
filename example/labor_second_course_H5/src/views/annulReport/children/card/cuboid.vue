<script setup lang="ts">
const props = defineProps<{
  topColor: string;
  frontColor: string;
  asideColor: string;
  index: number;
  cover: string | null;
}>();
</script>

<template>
  <div>
    <div class="cuboid">
      <div
        class="cuboid-top"
        :style="{
          backgroundColor: props.topColor,
          backgroundImage: index == 0 ? `url(${props.cover})` : '',
        }"
        style="background-repeat: no-repeat; background-size: cover"
      ></div>
      <div
        class="cuboid-front"
        :style="{ backgroundColor: props.frontColor }"
      ></div>
      <div
        class="cuboid-aside"
        :style="{ backgroundColor: props.asideColor }"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.cuboid {
  transform-style: preserve-3d;
  transform: rotateX(330deg) rotateY(42deg);
  margin-bottom: -71%;
  .cuboid-top {
    height: 200px;
    transform: rotateX(80deg) translateZ(36px);
  }
  .cuboid-front {
    height: 30px;
    width: 99%;
    transform: rotateY(0deg) translateZ(19px) translateX(81px) translateY(-52px);
  }
  .cuboid-aside {
    height: 29px;
    transform: rotateY(-100deg) translateZ(20px) translateX(-169px)
      translateY(-43px);
  }
}
</style>
