/**
 * Fmp得分记录
 */
export interface FmpScoreRecord {
    /**
     * 记录时间戳
     */
    timestamp: number
    /**
     * 计算得到的fmp值
     */
    score: number
}

export interface IFmpCalculatorOptions {
    /**
     * 用户传入的自定义权重表
     */
    customElementWeightTable?: Record<string, number>
}