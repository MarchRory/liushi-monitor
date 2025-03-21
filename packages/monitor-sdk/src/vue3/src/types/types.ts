type ScrollPositionCoordinates = {
    left?: number
    top?: number
    behavior?: "auto" | "instant" | "smooth"
}

export interface IHistoryStateValue {
    [key: string]: string | number | boolean | null | object
    /**
     * 
     */
    back: null | string
    /**
     * 当前页面 href
     */
    current: string
    forward: string
    /**
     * 页面栈层级
     */
    postion: number
    replaced: boolean
    /**
     * 滚动条信息
     */
    scroll: ScrollPositionCoordinates
}

export type HistoryParams = [IHistoryStateValue, Parameters<History['pushState']>['1'], Parameters<History['pushState']>['2']]