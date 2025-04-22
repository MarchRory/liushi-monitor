export type PerformanceEventTypes =
    'first_screen_fp'
    | 'first_screen_fcp'
    | 'first_screen_lcp'
    | 'first_screen_ttfb'
    | "inp"
    | "cls"
    | "http"
    | "vue3_spa_page_load_time"

export type ICommomWebVitalsValue = {
    value: number
    rating: "good" | "needs-improvement" | "poor"
}

export type IFcpData = ICommomWebVitalsValue & {
    firstByteToFCP?: number
    timeToFirstByte?: number
}

export type IFpData = ICommomWebVitalsValue & {}

export type ILcpData = ICommomWebVitalsValue & {
    timeToFirstByte?: number
    lcpResourceUrl?: string
    lcpResourceSize?: number
    elementRenderDelay?: number
    element: string
}

export type ITtfb = ICommomWebVitalsValue & {
    waitingDuration?: number
    requestDuration?: number
    dnsDuration?: number
    connectionDuration?: number
    cacheDuration?: number
}

export type IFirstScreenIndicatorData = {
    first_screen_fcp: IFcpData
    first_screen_fp: IFpData
    first_screen_lcp: ILcpData
    first_screen_ttfb: ITtfb
}

export type ISpaPageLoadIndicatorData = {
    value: number
}

export type IHttpReqIndicatorData = {
    responseType: string,
    interfaceUrl: string,
    responseCode: number,
    spentTime: number,
    method: string,
    originRequestType: "fetch" | "xhr"
}