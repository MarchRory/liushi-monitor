<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()
const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))


// tabs切换逻辑
const tabs = [
    { name: '我的计划', path: '/personalPlan/userPlanList' },
    // { name: "待创建", path: '/personalPlan/createPlan' }
]
const activeTab = ref(0)
const handleSwitchTab = (tabIndex: number) => {
    const {path} = tabs[tabIndex]
    router.push((path))
}
</script>

<template>
    <div class="plan-container">
        <XdHeader title="个人计划" back-path="/user" />
        <van-tabs
            v-model:active="activeTab"
            :ellipsis="false"
            sticky
            @change="handleSwitchTab"
            color="#ffac40"
        >
            <van-tab
                v-for="(tab, index) in tabs"
                :key="index"
                :title="tab.name"
            >
                
            </van-tab>
        </van-tabs>
        <main>
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </main>
    </div>
</template>

<style scoped lang="less">
:deep(.van-empty) {
    transform: translateY(80%);
}
:deep(.van-cell) {
    padding: 10px 0px;
    background-color: transparent
}
.plan-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    main {
        flex: 1;
        width: 100%;
        overflow-y: auto;
        background-color: rgb(244, 248, 251);
        .empty-icon {
            font-size: 120px;
            color: rgb(194, 194, 194);
        }
    }
}
</style>