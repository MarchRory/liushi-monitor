import { Interaction as InteractionModel } from '.prisma/client'

import {
    IBaseBreadCrumbItem,
    IBaseClickElementInfo,
    IBaseTransformedData,
    TransformedBehaviorData,
    UserBehaviorEventTypes
} from "../types";


function clickLogTransformer(
    origin: IBaseClickElementInfo[]
): Pick<InteractionModel, 'pageX' | "pageY" | "nodeName" | "featureInfo" | "componentTypeId">[] {
    return origin.map((item) => ({
        pageX: item.pageX,
        pageY: item.pageY,
        nodeName: item.nodeName || '',
        componentTypeId: item?.componentTypeId ? item?.componentTypeId : null,
        featureInfo: JSON.stringify({
            innerText: item.innerText || "",
            targetClassList: item.targetClassList || ''
        }),
    }))
}

function pageExposureLogTransformer(
    origin: IBaseBreadCrumbItem[]
) {
    return origin.map((item) => ({
        value: item.page_exposure,
        stack: item.stack.join('->'),
        url: item.url
    }))
}

function moduleExposureLogTransformer() {

}

export default function (
    indicatorName: UserBehaviorEventTypes,
    originCollectedData: IBaseTransformedData<'userBehavior'>['collectedData']['data'] | null
): TransformedBehaviorData[] {
    if (originCollectedData === null) return []

    if (['compClick', 'defaultClick'].includes(indicatorName)) {
        return clickLogTransformer(originCollectedData as IBaseClickElementInfo[])
    } else if (indicatorName === 'page_exposure') {
        return pageExposureLogTransformer(originCollectedData as IBaseBreadCrumbItem[])
    } else if (indicatorName === 'module_exposure') {
        // TODO: 模块曝光的日志清洗
        return []
    }

    return []
}
