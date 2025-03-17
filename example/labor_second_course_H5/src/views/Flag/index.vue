<script setup lang="ts">
import {FlagItem, getFLagListApi} from '@/api/user/user'
import { HeaderDefaultAction } from '@/components/header/types';
import useAutoLoadList from '@/hooks/useAutoLoadList'
import useLoading from '@/hooks/useLoading';
import { registerTimingLog } from '@/utils/logger/hooks';
const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))
const FlagPreview = defineAsyncComponent(() => import('./components/flag-preview.vue'))
const { isFinished,  isRefreash, pageParams, listData, loading, loadList, onRefresh } = useAutoLoadList<FlagItem>({
    requestApi: getFLagListApi
})

const {loading: initLoading, setLoading: setInitLoading} = useLoading(true)
const isInit = ref(true)
const router = useRouter()
const headerActions: HeaderDefaultAction[] = [
    {icon: 'tabler:flag-plus', trigger: () => router.push({path: '/createFlag'})}
]

const handleDelete = (id: number | string) => {
    const index = listData.value.findIndex(flag => flag.id === id)
    listData.value.splice(index, 1)
    if (!listData.value.length) {
        isFinished.value = true
        pageParams.value.pageNum! = 1
    }
}

const handleUpdate = (newFlagInfo: FlagItem) => {
    const {id} = newFlagInfo
    const index = listData.value.findIndex(flag => flag.id === id)
    listData.value.splice(index, 1, newFlagInfo)
}

const init = async () => {
    isInit.value = true
    await loadList()
    isInit.value = false
    setInitLoading(false)
}

init()

registerTimingLog()
</script>

<template>
    <div class="flag-container">
        <XdHeader title="Flag" :actions="headerActions" />
        <main>
            <van-toast v-model:show="initLoading" type="loading" message="Flag获取中" />
            <van-empty v-if="!isInit && !listData.length" image-size="100" description="暂无flag" >
                <template #image>
                    <t-icon icon="tabler:flag-question" class="empty-icon" />
                </template>
            </van-empty>
            <van-pull-refresh v-else v-model="isRefreash" @refresh="onRefresh">
                <van-list
                    v-model:loading="loading"
                    @load="loadList"
                    :finished="isFinished"
                    finished-text="已经到底了"
                >
                    <van-cell v-for="(flag, index) in listData" :key="index">
                        <FlagPreview 
                            :flag-item="flag" 
                            @on-delete="handleDelete" 
                            @on-update="handleUpdate"
                        />
                    </van-cell>
                </van-list>
            </van-pull-refresh>
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
.flag-container {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-start;
    background-color: rgb(244, 248, 251);
    main {
        width: 100%;
        flex: 1;
        overflow-y: auto;
        .empty-icon {
            font-size: 120px;
            color: rgb(194, 194, 194);
        }
    }
}
</style>