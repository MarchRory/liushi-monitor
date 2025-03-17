import { PlanState } from "@/api/types/user";

interface PlanStateConfig {
    icon: string
    label: string
    color: string
}

type PlanStateMapType = {
    [key in PlanState]: PlanStateConfig
}

export const PlanStateMap: PlanStateMapType = {
    [PlanState.beforeStart]: {
        icon: 'tabler:alert-hexagon-filled',
        label: '暂未开始',
        color: '#abb1c3'
    },
    [PlanState.ing]: {
        icon: 'tabler:hourglass-high',
        label: '进行中',
        color: '#11a2f7'
    },
    [PlanState.complete]: {
        icon: 'tabler:mood-smile-filled',
        label: '已完成',
        color: '#e2760f'
    },
    [PlanState.fail]: {
        icon: 'tabler:mood-sad-filled',
        label: '未完成',
        color: 'Flag卒'
    }
}