import { PerformanceEventTypes } from "src/modules/monitor/types"

export interface IBaseChatDataCache {
    lastUpdateTime: string
    metric: PerformanceEventTypes
    timestamps: Date[]
    data: number[]
}