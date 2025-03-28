import { IPluginTransportDataBaseInfo } from "monitor-sdk/src/types"

/**
 * Fmp得分记录
 */
// export type FmpScoreRecord = IPluginTransportDataBaseInfo<'', {
//     score: number
// }>

export interface IFmpCalculatorOptions {
    /**
     * 用户传入的自定义权重表
     */
    customElementWeightTable?: Record<string, number>
}