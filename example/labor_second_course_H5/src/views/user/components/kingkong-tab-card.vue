<script setup lang="ts">
import type {KingkongTabItem} from './type.ts'
const router = useRouter()
const props = defineProps<{
    title: string;
    tabs: KingkongTabItem[];
}>()

const clickTab = (kingkongTab: KingkongTabItem) => {
    if (kingkongTab.customTrigger) {
        kingkongTab.customTrigger()
    }else {
        const {path} = kingkongTab
        router.push({path})
    }
}

</script>

<template>
    <div class="course-card-container">
        <div class="top-bar">
            <span class="title">{{ props.title }}</span>
        </div>
        <div class="tab-container">
            <div
                v-for="(tab, index) in props.tabs"
                :key="index"
                class="kingkongTab"
                :class="{
                    'dot': tab.dot
                }"
                @click="clickTab(tab)"
            >
                <t-icon class="tab-icon" :icon="tab.icon" />
                <div class="tab-label">{{ tab.label }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.course-card-container {
    margin: 20px 0;
    background-color: white;
    box-shadow: 0px 0px 16px -5px rgba(0,0,0,0.1); 
    border-radius: 15px;
    padding: 15px 30px;
    width: calc(100% - 60px);
    height: max-content;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    .top-bar {
        display: flex;
        align-items: flex-start;
        .title {
            font-weight: 600;
            font-size: 1.1em;
        }
        margin-bottom: 40px;
    }
    .tab-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;
        .kingkongTab {
            width: 25%;
            margin-bottom: 35px;
            .tab-icon {
                font-size: 1.6em;
            }
            .tab-label {
                font-size: 0.8em;
                font-weight: bolder;
                margin-top: 5px;
            }
        }
        .dot {
            &::before {
                content: '';
                display: block;
                width: 15px;
                aspect-ratio: 1/1;
                border-radius: 50%;
                background-color: #f84545;
                position: absolute;
                transform: translateX(110px);
            }
        }
    }
}
</style>