import { DEFAULT_FMP_ELEMENT_WEIGHT_TABLE } from "monitor-sdk/src/configs/constant"
import { FmpScoreRecord, IFmpCalculatorOptions } from "../types/fmp"
import { getCurrentUrl } from "monitor-sdk/src/utils/url"
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time"

/**
 * TODO: Fmp 指标计算器
 */
class FmpCalculator {
    /**
     * 元素权重表
     */
    private readonly elementWeightTable: Record<string, number>
    /**
     * fmp得分映射, <url, FmpScoreRecord>
     */
    private readonly fmpScoreMap: Map<string, FmpScoreRecord> = new Map()
    /**
     * 考虑到用户实际操作, 有可能存在同时计算若干页面fmp的情况
     */
    private readonly observers: MutationObserver[] = []
    constructor(options: IFmpCalculatorOptions) {
        const {
            customElementWeightTable = DEFAULT_FMP_ELEMENT_WEIGHT_TABLE
        } = options
        this.elementWeightTable = customElementWeightTable
    }
    /**
     * 观测当前页面的fmp
     */
    observe() {
        const currentUrl = getCurrentUrl()
        const observe = new MutationObserver(this.mutationsCallback)
        observe.observe(document, {
            childList: true,
            subtree: true,
            attributes: true
        })
        // 6秒后销毁观察者并终止未停止的计算, 避免阻塞和内存泄漏
        setTimeout(() => this.stop(observe), 6 * 1000)
    }
    private mutationsCallback(entries: MutationRecord[]) {
        console.log(getCurrentTimeStamp(), ': ', entries)
    }
    /**
     * 超时停止计算, 避免阻塞和内存泄漏
     */
    private stop(observer: MutationObserver) {
        observer.disconnect()
    }
}

export default FmpCalculator