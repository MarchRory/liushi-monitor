<script setup lang="ts">
import { CSSProperties } from 'vue';
import { useBoolean } from '@/hooks/common'

interface Props {
    /**
     * @description 点击时触发的方法
     */
    trigger: (...args: any[]) => Promise<any>
    /**
     * @description 悬浮球图标
     */
    icon?: string
    iconColor?: string
    /**
     * @description 触发器方法执行期间, 图标是否需要自旋转
     */
    needRotate?: boolean
    /**
     * @description 是否启用球形
     */
    ball?: boolean
    /**
     * @description needRotate === true时生效
     */
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    iconColor: "#599cf0",
    needRotate: false,
    icon: 'tabler:reload',
    ball: false
})

const emits = defineEmits<{
    (e: 'onSuccess'): void
}>()

const CustomStyle = computed<CSSProperties>(() => {
    const {ball} = toRefs(props)
    return {
        borderRadius: `${ball.value ? '50%' : '20%'}`
    }
})

const [isRefresh, setRefresh] = useBoolean(false)
const handleClick = async () => {
    setRefresh(true)
    await props.trigger()
}

watch(
    () => props.loading,
    (newVal) => {
        if (!newVal && isRefresh.value) {
            setRefresh(false)
        }
    }
)
</script>

<template>
    <div
        class="suspense-ball"
        :style="CustomStyle"
        @click="handleClick"
    >
        <t-icon
            class="suspense-ball-icon"
            :icon="props.icon"
            :color="props.iconColor"
            :class="{
                'refresh-spin': props.needRotate && isRefresh && props.loading
            }"
        />
    </div>
</template>

<style scoped lang="less">
.suspense {
    &-ball {
        position: fixed;
        width: 80px;
        aspect-ratio: 1/1;
        background-color: white;
        bottom: calc(var(--van-tabbar-height) + 40px);
        box-shadow: -3px 11px 40px -7px rgba(109, 109, 109, 0.397);
        right: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        &-icon {
            font-size: 60px;
        }
    } 
}
.refresh-spin {
    animation: spin .6s linear infinite;

}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>