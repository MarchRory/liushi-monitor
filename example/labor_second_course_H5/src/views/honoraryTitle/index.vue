<script setup lang="ts">
import { registerTimingLog } from '@/utils/logger/hooks';

const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))
const BadgeGroup = defineAsyncComponent(() => import('./components/badgeGroup.vue'))


registerTimingLog()
</script>

<template>
    <div class="honorary-container">
        <XdHeader title="荣誉墙"/>
        <main>
            <BadgeGroup title="成长系列" />
        </main>
    </div>
</template>

<style scoped lang="less">
.honorary-container {
    overflow-y: hidden;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    main {
        flex: 1;
        overflow-y: auto;
        width: 100%;
    }
}
</style>