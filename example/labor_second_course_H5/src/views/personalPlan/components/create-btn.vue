<script setup lang="ts">
/**
 * @description 可能以后会有别的复杂UI, 所以单独抽离出来
 */
import type { ToCreatePlanItem } from '@/api/types/user';
const props = defineProps<{
    createInfo: ToCreatePlanItem
}>()
</script>

<template>
    <div class="plan-to-create-container" @click="$router.push({path: '/createPlanForm', query: props.createInfo})">
        <div class="to-create-plan-name">
            {{ props.createInfo.objectivesName }}
        </div>
        <ul class="to-create-plan-info-list">
            <li>{{ props.createInfo.type || '暂未设置' }}</li>
            &nbsp;|&nbsp;
            <li>{{ props.createInfo.majorName }}</li>
            &nbsp;|&nbsp;
            <li>{{ props.createInfo.grade }}级</li>
        </ul>
        <div class="to-create-guide-btn">
            <t-icon icon="tabler:square-rounded-plus-filled" class="to-create-icon" />
            <span>去创建</span>
        </div>
    </div>
</template>

<style scoped lang="less">
.plan-to-create-container {
    margin: 20px auto;
    width: 92%;
    height: 200px;
    border-radius: 15px;
    border: 5px dashed #ffac40;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    .to-create-plan-name {
        height: 80px;
        width: 80%;
        text-align: center;
        text-overflow: ellipsis;
        font-size: 1.3em;
        font-weight: 700;
        color: #f1a035;
    }
    .to-create-plan-info-list {
        width: max-content;
        margin-bottom: 15px;
        color: #f1a035;
        display: flex;
        align-items: center;
        justify-content: space-around;
        li {
            display: inline-block;
        }
    }
    .to-create-guide-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        .to-create-icon {
            color: #df8d23;
            font-size: 40px;
            margin-right: 10px;
        }
        span {
            color: #f1a035;
        }
    }
}

</style>