<script setup lang="ts">
/**
 * @description 待创建的计划列表
 */
import { getToCreatePlanList } from '@/api/plan';
import { ToCreatePlanItem } from '@/api/types/user';
import useLoading from '@/hooks/useLoading';
import { useBoolean } from '@/hooks/common'

const ToCreateBtn = defineAsyncComponent(() => import('../components/create-btn.vue'))
const {loading: initLoading, setLoading: setInitLoading} = useLoading(true)
const [isInit, setInit] = useBoolean(true)
const [isFinished, setFinish] = useBoolean(false)

const listData = ref<ToCreatePlanItem[]>([])
const {loading, setLoading} = useLoading(false)
const [isRefreash, setRefreash] = useBoolean(false)

const loadList = () => {
    return new Promise((resolve) => {
        setFinish(false)
        setLoading(true)
        getToCreatePlanList().then(({data}) => {
            listData.value = data
        }).finally(() => {
            setLoading(false)
            setFinish(true)
            resolve(true)
        })
    })
}

const init = async () => {
    setInit(true)
    await loadList()
    setInit(false)
    setInitLoading(false)
}

const onRefresh = async () => {
    setRefreash(true)
    await init()
    setRefreash(false)
}   

const route = useRoute()
onActivated(() => {
    if (route.query.needUpdate) {
        init()
    }
})

init()
</script>

<template>
    <div class="user-plan-list-container">
        <van-toast v-model:show="initLoading" type="loading" message="数据获取中" />
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
                <van-cell v-for="(toCreate, index) in listData" :key="index">
                    <ToCreateBtn :create-info="toCreate" />
                </van-cell>
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<style scoped lang="less">
.user-plan-list-container {
    width: 100%;
    overflow-y: auto;
    background-color: rgb(244, 248, 251);
    .empty-icon {
        font-size: 120px;
        color: rgb(194, 194, 194);
    }
}
</style>