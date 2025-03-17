<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter()

const jumpToSetting = () => {
    router.push({
        path: '/accountSetting'
    })
}

</script>

<template>
    <div class="user-header">
        <t-icon icon="tabler:settings" :width="25" color="gray" @click="jumpToSetting" />
    </div>
</template>

<style scoped lang="less">
.user-header {
    margin: 0 auto;
    width: 100%;
    height: 80px;
    background-color: transparent;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
}
</style>