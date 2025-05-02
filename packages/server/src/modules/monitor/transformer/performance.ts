import {
    IBaseTransformedData,
    IFirstScreenIndicatorData,
    IHttpReqIndicatorData,
    ISpaPageLoadIndicatorData,
    PerformanceEventTypes,
    TransformedPerformanceData
} from "../types";

function firstScreenTransformer(
    origin: IFirstScreenIndicatorData[keyof IFirstScreenIndicatorData]
) {
    const { value, rating } = origin
    return {
        value,
        rating,
        detail: JSON.stringify(origin)
    }
}

function httpTransformter(
    origin: IHttpReqIndicatorData
) {
    return origin
}

function spaLoadTransformer(
    origin: ISpaPageLoadIndicatorData
) {
    return {
        value: origin.value,
        rating: '',
        detail: JSON.stringify(origin)
    }
}

function clsTransformer(
) {

}

export default function (
    indicatorName: PerformanceEventTypes,
    originCollectedData: IBaseTransformedData<'performance'>['collectedData']['data'] | null
): TransformedPerformanceData | object {
    if (originCollectedData === null) return {}

    if (indicatorName === 'http') {
        return httpTransformter(originCollectedData as IHttpReqIndicatorData)
    } else if (indicatorName === 'vue3_spa_page_load_time') {
        return spaLoadTransformer(originCollectedData as ISpaPageLoadIndicatorData)
    } else if (['first_screen_fp', 'first_screen_fcp', 'first_screen_lcp', 'first_screen_ttfb'].includes(indicatorName)) {
        return firstScreenTransformer(originCollectedData.data as Parameters<typeof firstScreenTransformer>[0])
    } else if (indicatorName === 'cls') {

    }

    return originCollectedData
}