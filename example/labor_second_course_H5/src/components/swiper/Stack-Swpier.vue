<script setup lang="ts">
/**
 * @description 层叠轮播图， 因为核心功能和swpier重叠度高, 所以放在swpier这一分类
 */
import { StackSwiperProps } from './types'
import useStackSwiper from './hooks/useStackSwiper'
const SwiperDots = defineAsyncComponent(() => import('./dots.vue'))

const props = withDefaults(defineProps<StackSwiperProps>(), {
    total: 1,
    activeTab: 0,
    width: '100%',
    height: '100%',
    offset: 150
})
const emits = defineEmits<{
    (e: 'onChange', currentTab: number): void
    (e: 'onMoveEnd', current: number): void
}>()

const { 
    current,
    renderList,
    handleTouchStart,
    handleTouchMove,
} = useStackSwiper(props)

watch(
    () => current.value,
    (newVal) => {
        emits('onChange', newVal)
    }
)

</script>

<template>
    <div 
        class="stack-swiper-container"
        :style="{
            width: props.width,
            height: props.height
        }" 
        @scroll.stop
        @touchstart.stop="handleTouchStart"
        @touchmove.prevent.stop="handleTouchMove"
        @touchend.stop="emits('onMoveEnd', activeTab)"
    >
        <section class="stack-swiper-list">
            <div>
                <div
                    v-for="(item, index) in renderList"
                    class="stack-swiper-item"
                    :style="item.style"
                >
                    <slot name="item" :item="item.data" :index="index">
                        {{ index }}
                    </slot>
                </div>
            </div>
        </section>
        <SwiperDots :current="current" :total="props.total" height="5%" />
    </div>
</template>

<style scoped lang="less">
.stack-swiper {
    &-container {
        overflow-x: scroll;
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        z-index: 100;
    }
    &-list {
        width: 100%;
        height: 95%;
        overflow-x: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        &>div {
            position: relative;
            width: max-content;
            height: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: center;
        }
    }
    &-item {
        position: absolute;
        width: 80vw;
        height: 95%;
        transition: all .4s ease;
    }
}
</style>