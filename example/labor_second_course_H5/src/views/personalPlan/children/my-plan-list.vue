<script setup lang="ts">
/**
 * @description 个人已创建的计划列表
 */
import { getPlanListAPI } from '@/api/plan';
import { CourseCategoryType } from '@/api/types/public';
import { PlanItem } from '@/api/types/user';
import useAutoLoadList from '@/hooks/useAutoLoadList';
import useLoading from '@/hooks/useLoading';
import { useBoolean } from '@/hooks/common'

const PlanPreview = defineAsyncComponent(() => import('../components/plan-preview.vue'))
const {loading: initLoading, setLoading: setInitLoading} = useLoading(true)
const [isInit, setInit] = useBoolean(true)

const { loading, listData, isFinished, isRefreash, loadList, onRefresh } = useAutoLoadList<PlanItem, {grade: string, type: CourseCategoryType}>({
    requestApi: getPlanListAPI,
    otherRequestParms: {grade: "", type: ""}
})

const init = async () => {
    setInit(true)
    await loadList()
    setInit(false)
    setInitLoading(false)
}

init()
</script>

<template>
    <div class="user-plan-list-container">
        <van-toast v-model:show="initLoading" type="loading" message="学生计划获取中" />
        <van-empty v-if="!isInit && !listData.length" image-size="100" description="暂无数据" >
            <template #image>
                <t-icon icon="tabler:list" class="empty-icon" />
            </template>
        </van-empty>
        <van-pull-refresh v-else v-model="isRefreash" @refresh="onRefresh">
            <van-list
                v-model:loading="loading"
                @load="loadList"
                :finished="isFinished"
                finished-text="已经到底了"
            >
                <van-cell v-for="(plan, index) in listData" :key="index">
                    <PlanPreview :plan="plan" />
                </van-cell>
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<style scoped lang="less">
.user-plan-list-container {
    width: 100%;
    height: max-content;
    background-color: rgb(244, 248, 251);
    .empty-icon {
        font-size: 120px;
        color: rgb(194, 194, 194);
        .card-shadow;
    }
}
</style>