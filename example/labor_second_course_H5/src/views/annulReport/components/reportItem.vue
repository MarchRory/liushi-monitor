<script setup lang="ts">
import { annualReportListItemType } from '@/api/types/annualReport';
import { useRouter } from 'vue-router';

interface Props {
    preview: annualReportListItemType,
    isActive: boolean,
    index: number
}


const props = defineProps<Props>()
const emits = defineEmits<{
    (e: 'onToBeActive', index: number): void
}>()

const router = useRouter()

const handleClick = () => {
    if (props.isActive) {
        openAnnulReport()
    }else {
        emits('onToBeActive', props.index)
    }
}
const openAnnulReport = () => {
  router.push({
    path: "/reportPage",
    query: { reportId: props.preview.id },
  });
}

</script>

<template>
    <div class="report-preview" 
        :style="{
            backgroundImage: `url(${props.preview.cover})`,
            filter: `brightness(${isActive ? 0.8 : 0.5})`
        }"
        @click="handleClick"
    >
        <div class="report-mask">
            <div class="mask-header"></div>
            <div class="mask-footer">
                <span class="footer-title">{{ props.preview.reportBatchName}}</span>
                <span class="footer-time">
                    {{ props.preview.start.slice(0,10) }} ~ {{ props.preview.end.slice(0,10) }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.report-preview {
    position: relative;
    .card-shadow;
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
    border-radius: 15px;
    transition: all .4s ease;
}
.report-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 15px;
    background: linear-gradient(to bottom, #ffffff00 5%, #111111e0);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    .mask-header, .mask-footer {
        padding: 20px;
        width: calc(100% - 40px);
        border-radius: 15px;
    }
    .mask-header {
        min-height: 30%;
    }
    .mask-footer {
        min-height: calc(20% - 40px);
        height: auto;
        text-align: left;
        color: white;
        font-size: 50px;
        font-weight: bolder;
        word-wrap: break-word;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        flex-direction: column;
        .footer-time {
            margin-top: 10px;
            font-size: 25px;
        }
    }
}
</style>