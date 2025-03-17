<script setup lang="ts">
import { HeaderDefaultAction } from '@/components/header/types';
import { useBoolean } from '@/hooks/common'
import { HomeSearchParams } from './types'
import { CourseCategoryMap, CourseCategoryType, CourseStateEnum, courseStateMap } from '@/api/types/public';
import { deepClone } from '@/utils/dataUtil/common';
/**
 * @description 虚拟列表瀑布流组件, 本项目中默认给课程列表使用
 */

const props = defineProps<{
    category: HomeSearchParams['category']
    state: HomeSearchParams['state']
}>()

const emits = defineEmits<{
    (e: 'onTabChange', newTab: number): void
    (e: 'onSearchParamsChange', params: HomeSearchParams): void
}>()
const router = useRouter()

const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))

// header actions逻辑
const actions: HeaderDefaultAction[] = [
    {icon: 'tabler:search', trigger: () => router.push({path: "/searchRes"})}
]

// tab切换逻辑
const activeTab = ref(0)
const tabs = [
    {title: '全校', value: 0},
    {title: '本院', value: 1}
]

// menu选择逻辑
const [menuVisible, setVisible] = useBoolean(false)
const params = ref<HomeSearchParams>({
    category: "",
    state: 0
})
watch(
    () => [props.category, props.state], 
    ([category, state]) => {
       params.value.category = category as CourseCategoryType
       params.value.state = state as CourseStateEnum
    }
)

const chooseCategory = (newCateGory: CourseCategoryType) => {
    params.value.category = newCateGory
}
const chooseState = (newState: number) => {
    params.value.state = newState
}

// 退出按钮
const quit = () => {
    setVisible(false)
    setTimeout(() => {
        params.value.category = props.category
        params.value.state = props.state
    }, 200)
}

// 筛选按钮
const filter = () => {
    const {category, state} = params.value
    emits('onSearchParamsChange', {category, state})
    setVisible(false)
}

const filterStateMap = computed(() => {
    const filterTabs = deepClone(courseStateMap)
    // @ts-ignore
    // delete filterTabs[CourseStateEnum.examining]
    return filterTabs
})
</script>

<template>
    <XdHeader hiden-back :actions="actions">
        <template #left>
            <t-icon class="category-controller" icon="tabler:category" @click="setVisible(true)" />
        </template>
        <template #center>
            <van-tabs
                v-model:active="activeTab"
                :ellipsis="false"
                sticky
                @change="(tabKey) => $emit('onTabChange', tabKey)"
                color="#ffac40"
            >
                <van-tab
                    v-for="(tab, index) in tabs"
                    :key="index"
                    :title="tab.title"
                >
                    
                </van-tab>
            </van-tabs>
        </template>
    </XdHeader>
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
            height: '100%'
        }"
    >   
        <div class="menu-container">
            <div class="menu-list">
                <div class="menu-card">
                    <div class="menu-card-title"><t-icon icon="tabler:brand-linktree" />课程类别</div>
                    <div class="menu-card-options">
                        <div
                            v-for="(category, key, index) in CourseCategoryMap"
                            :key="index"
                            class="menu-option-item"
                            @click="chooseCategory(category['value'])"
                            :class="{
                                'menu-active-option': params.category == category['value']
                            }"
                        >
                            {{ key }}
                        </div>
                    </div>
                </div>
                <div class="split-line" />
                <div class="menu-card">
                    <div class="menu-card-title"><t-icon icon="tabler:status-change" />课程状态</div>
                    <div class="menu-card-options">
                        <div
                            v-for="(config, state, index) in filterStateMap"
                            :key="index"
                            class="menu-option-item"
                            @click="chooseState(state)"
                            :class="{
                                'menu-active-option': params.state == state
                            }"
                        >
                            {{ config.label }}
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

<style scoped lang="less">
.category-controller {
    font-size: 45px;
}

:deep(.van-tabs) {
    position: relative;
    bottom: 30px;
}
:deep(.van-tab__text) {
    font-size: 30px;
}
:deep(.van-sticky--fixed) {
    padding-top: 25px !important;
    padding-bottom: 0 !important;
}
:deep(.van-tabs__line) {
    bottom: 40px;
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
        &>div {
            padding: 10px 60px;
            font-size: 30px;
            font-weight: bold;
            letter-spacing: 5px;
            border: 4px solid;
        }
        &>.quit-btn {
            border-top-left-radius: 0;
            border-bottom-left-radius: 30px;
            border-color: #fa9e25;
            color: #fa9e25;
        }
        &>.filter-btn {
            border-top-right-radius: 0;
            border-bottom-right-radius: 30px;
            border-color: transparent;
            background-color: #fa9e25;
            color: white;
        }
    }
}
</style>