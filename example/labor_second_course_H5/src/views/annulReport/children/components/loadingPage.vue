<script setup lang="ts">
const props = defineProps<{
  progress: number;
}>();
</script>

<template>
  <div>
    <div id="waitngBackendLoading">
      <transition>
        <van-loading v-if="props.progress == 0" color="#e77230" vertical
          >正在统计数据</van-loading
        >
      </transition>
    </div>
  </div>
</template>

<style scoped>
#waitngBackendLoading {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  padding: 30px;
  background-color: #e2e2e29c;
  backdrop-filter: blur(10px);
}
</style>
