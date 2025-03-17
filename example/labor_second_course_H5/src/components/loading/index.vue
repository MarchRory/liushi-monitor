<script setup lang="ts">
/**
 * @description 基础列表加载loading
 */
import {CustomLoadingProps} from './types'

const props = withDefaults(defineProps<CustomLoadingProps>(), {
    visible: false,
    color: '#fa9e25'
})
const {visible, color} = toRefs(props)
</script>

<template>
    <Transition name="xd-scale-in">
        <div v-if="visible"  class="xd-loading" />
    </Transition>
</template>

<style scoped lang="less">
.xd-loading {
    @loading-width: 80px;
    z-index: 9999;
    position: absolute;
    top: 40%;
    // 避开tranform实现绝对定位, 防止影响过渡动画
    left: calc(50% - @loading-width * 0.5);
    background-color: white;
    width: @loading-width;
    aspect-ratio: 1/1;
    border-radius: 50%;
    box-shadow: 5px 4px 40px -6px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    &::before, &::after {
        position: absolute;
        display: block;
        content: '';
        border-radius: 50%;
        aspect-ratio: 1/1;
        background-color: transparent;
        border: 4px solid v-bind(color);
        animation: doubleSpin .7s linear infinite;
    }
    &::before {
        width: @loading-width * 0.55;
        border-top-color: transparent;
        animation-direction: normal;
    }
    &::after {
        width: @loading-width * 0.2;
        border-bottom-color: transparent;
        animation-direction: reverse;
    }
    @keyframes doubleSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
}

.xd-scale-in-enter-active, .xd-scale-in-leave-active {
    transition: transform .5s ease;
}
.xd-scale-in-enter-to,  .xd-scale-in-leave-from{
    transform: scale(1);
}
.xd-scale-in-enter-from,  .xd-scale-in-leave-to{
    transform: scale(0);
}
</style>