<script setup lang="ts">
import { FlagItem, deleteFlagApi, updateFlagApi } from '@/api/user/user'
import { flagStateMap } from '../config';
import { showConfirmDialog, showSuccessToast } from 'vant';
import { useBoolean } from '@/hooks/common'
import { FlagStateEnum } from '../config';
import useLoading from '@/hooks/useLoading';

const props = defineProps<{
    flagItem: FlagItem
}>()
const emits = defineEmits<{
    (e: 'onDelete', id: number|string): void
    (e: 'onUpdate', newFlagInfo: FlagItem): void
}>()
const CommentTrigger = defineAsyncComponent(() => import('@/components/commentCore/input-trigger.vue'))

const {loading, setLoading} = useLoading(false)

const deleteFlag = () => {
    showConfirmDialog({
        title: "删除Flag",
        message: "Flag虽小, 也需坚持",
    })
    .then(async () => {
        // on confirm
        const {id} = props.flagItem
        await deleteFlagApi(id)
        showSuccessToast({
            message: 'Flag删除成功',
            duration: 600
        })
        menuToggle(false)
        setTimeout(() => {
            emits('onDelete', id)
        }, 700)
    })
    .catch(() => {
      // on cancel
    });
}

// menu配置和逻辑
const [menuVisible, menuToggle] = useBoolean(false)
const updateState = async (state: FlagStateEnum) => {
    setLoading(true)
    const data = {
        ...props.flagItem,
        state
    }
    try {
        await updateFlagApi(data)
        menuToggle(false)
        setTimeout(() => {
            emits('onUpdate', data)
        }, 500)
    }finally {
        setLoading(false)
    }
}
const completeFlag = () => {
    updateState(FlagStateEnum.complete)
}
const failFlag = () => {
    updateState(FlagStateEnum.fail)
}
const menuConfig = computed(() => [
    { 
        icon: flagStateMap[FlagStateEnum.complete]?.icon, 
        color: '#969696',
        label: '完成Flag', 
        canUse: props.flagItem.state === FlagStateEnum.ing, 
        trigger: completeFlag
    },
    { 
        icon: flagStateMap[FlagStateEnum.fail]?.icon,
        color:'#969696', 
        label: '失败', 
        canUse: props.flagItem.state === FlagStateEnum.ing, 
        trigger: failFlag
    },
    { 
        icon: "tabler:trash" ,
        label: '删除Flag',
        color: '#f56e6e',
        canUse: true,
        trigger: deleteFlag
    }
])

// 评论逻辑
const triggerDom = ref()
const handleSubmit = async (comment: string) => {
    setLoading(true)
    const data = {
        ...props.flagItem,
        comment
    }
    try {
        await updateFlagApi(data)
        menuToggle(false)
        triggerDom.value.clear()
        setTimeout(() => {
            emits('onUpdate', data)
        }, 500)
    }finally {
        setLoading(false)
    }
}

</script>

<template>
    <div>
        <div class="flag-preview-container">
            <section class="flag-preview-header">
                <div>
                    <t-icon class="flag-icon" :icon="flagStateMap[props.flagItem.state || 2]?.icon" :color="flagStateMap[props.flagItem.state || 2]?.iconColor" />
                    <span>{{ flagStateMap[props.flagItem.state || 2]?.label }}</span>
                </div>
                <t-icon class="flag-icon" @click="menuToggle(true)" icon="tabler:chevron-down" color="#787878" />
            </section>
            <article class="flag-preview-content">
                {{ props.flagItem.content}}
            </article>
            <section class="flag-preview-footer">
                <CommentTrigger v-if="!props.flagItem.comment" ref="triggerDom" @submit="handleSubmit" />
                <div v-else class="comment">
                    <div class="comment-header">
                        <t-icon class="comment-icon" icon="tabler:message-2" color="#969696" />...
                    </div>
                    <article>{{ props.flagItem.comment }}</article>
                </div>
            </section>
        </div>
        <van-popup
            v-model:show="menuVisible"
            round
            position="bottom"
            :style="{ height: '45%' }"
            safe-area-inset-bottom
            duration="0.2"
        >
            <div class="flag-menu-container">
                <section class="flag-preview-menu">
                    <div 
                        v-for="(menuItem, index) in menuConfig.filter((item) => item.canUse)" 
                        :key="index" 
                        @click="menuItem.trigger"
                        class="flag-menu-item"
                    >
                        <t-icon class="flag-menu-icon" :icon="menuItem.icon" :color="menuItem.color" />
                        <div :style="{color: menuItem.color}">{{ menuItem.label }}</div>
                    </div>
                </section>
                <section>
                    <div class="quit-menu-btn" @click="menuToggle(false)">取消</div>
                </section>
            </div>
        </van-popup>
        <van-toast v-model:show="loading" type="loading" message="数据更新中"></van-toast>
    </div>
</template>

<style scoped lang="less">
.flag-preview-container {
    width: 100%;
    min-height: 200px;
    height: auto;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    section {
        width: 96%;
    }
    .flag-preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 70px;
        border-bottom: 4px solid rgb(239, 239, 239);
        &>div {
            display: flex;
            align-items: center;
        }
        .flag-icon {
            font-size: 50px;
            margin-right: 20px;
        }
        span {
            font-weight: bold;
        }
    }
    .flag-preview-footer {
        min-height: 70px;
        padding-bottom: 10px;
        height: auto;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .footer-icon {
            font-size: 50px;
        }
        .comment {
            width: 80%;
            padding: 15px;
            background-color: #f1f1f1;
            border-radius: 15px;
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            text-align: left;
            .comment-header {
                font-weight: 700;
                .comment-icon {
                    font-size: 35px;
                    margin-right: 10px;
                }
            }
            article {
                text-indent: 2em;
                font-size: 23px;
            }
        }
    }
    .flag-preview-content {
        flex: 1;
        text-align: start;
        text-indent: 2em;
        padding: 15px 1em;
        min-height: 200px;
        height: auto;
        word-break: normal;
        word-wrap: break-word;
    }
}
.flag-menu-container {
    padding: 80px 50px 50px 50px;
    height: calc(100% - 120px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    section {
        width: 100%;
    }
    .flag-preview-menu {
        width: 100%;
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        justify-content: space-between;
        .flag-menu-item {
            width: 100%;
            padding: 25px 0;
            display: flex;
            align-items: center;
            .flag-menu-icon {
                font-size: 60px;
                margin-right: 30px;
            }
            div {
                text-align: left;
                flex: 1;
                font-size: 32px;
                font-weight: 600;
                letter-spacing: 3px;
                border-bottom: 4px solid rgb(239, 239, 239);
            }
        }
    }
    .quit-menu-btn {
        text-align: center;
        font-size: 30px;
        font-weight: 600;
        letter-spacing: 5px;
        border-radius: 20px;
        width: 100%;
        padding-top: 20px;
        padding-bottom: 20px;
        background-color: #e7e7e7;
        color: #9d9d9d;
    }
}
</style>