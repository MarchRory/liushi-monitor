<script lang="ts">
import { toRefs } from "vue";
export default {
  props: {
    skeLoad: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  setup(props) {
    const { skeLoad } = toRefs(props);
    return {
      skeLoad,
    };
  },
};
</script>

<template>
  <div>
    <van-skeleton :style="{ marginTop: '10px' }" title :row="1" :loading="skeLoad" :round="true" title-width="375px">
      <template #template>
        <div :style="{ display: 'flex', flexDirection: 'column', width: '100%' }">
          <van-skeleton-paragraph style="height: 70px; border-radius: 10px" />
          <div :style="{ flex: 1, marginTop: '30px' }">
            <van-skeleton-image image-size="100%" style="height: 230px; border-radius: 10px" />
            <van-skeleton-paragraph row-width="100%" style="height: 15px; border-radius: 10px" />
            <van-skeleton-paragraph row-width="100%" style="height: 50px; border-radius: 10px" />
            <van-skeleton-paragraph row-width="100%" style="height: 15px; border-radius: 10px" />
          </div>
        </div>
      </template>
    </van-skeleton>
  </div>
</template>

<style scoped lang="less"></style>
