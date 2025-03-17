<script setup lang="ts">
/**
 * @description swiper指示点
 */
interface Props {
    total: number
    current: number
    height: string
}

const props = withDefaults(defineProps<Props>(), {
    total: 1,
    current: 0,
    height: '10%'
})

</script>

<template>
    <div class="swiper-dot-list" :style="{
        height: props.height,
    }">
        <span 
            v-for="(dot) in props.total" 
            :key="dot"
            class="swiper-dot-item"
            :style="{
                backgroundColor: dot-1 === props.current ? 'white' : '#5050507a'
            }"
        />
    </div> 
</template>

<style scoped lang="less">
.swiper-dot {
    &-list {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    &-item {
        width: 15px;
        aspect-ratio: 1/1;
        border-radius: 50%;
        margin: 0 20px;
        transition: all .3s ease;
    }
}
</style>