<script setup lang="ts">
import { badgeItem } from '../config';

const props = defineProps<{
    badge: badgeItem
}>()



</script>

<template>
    <div class="badge">
        <div class="badge-cover">
            <t-icon 
                v-if="!props.badge.imgSrc" 
                :icon="props.badge.icon" class="badge-icon" 
                :style="{
                    color: props.badge.isGain ? props.badge.activeColor : '#bebebe'
                }" 
            />
            <van-image
                v-else 
                :src="props.badge.imgSrc" 
                v-lazy="props.badge.imgSrc" 
                :width="100"
                fit="cover"
                :class="[`${props.badge.isGain ? '' : 'grayFilter'}`]"
            />
        </div>
        <div class="badge-label">
            <div class="badge-name">{{ props.badge.name }}</div>
            <div class="badge-condition">{{ props.badge.condition }}</div>
        </div>
    </div>
</template>

<style scoped lang="less">
.badge {
    width: 100%;
    height: 300px;
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;

    .badge-cover {
        display: flex;
        align-items: center;
        justify-content: center;
        .badge-icon {
            font-size: 130px;
        }
    }

    .badge-label {

        .badge-name {
            font-size: 30px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .badge-condition {
            font-size: 20px;
            color: #9d9d9d;
        }
    }
}

:deep(.grayFilter) {
    filter: grayscale(85%);
}
</style>