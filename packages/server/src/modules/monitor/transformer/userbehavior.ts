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
): Pick<InteractionModel, 'contactPoint' | "nodeName" | "featureInfo" | "componentTypeId">[] {
    return origin.map((item) => ({
        contactPoint: JSON.stringify({ clientX: item.clientX, clicntY: item.clientY }),
        nodeName: item.nodeName || '',
        componentTypeId: item?.componentTypeId || '',
        featureInfo: JSON.stringify({
            innerText: item.innerText || "",
            targetClassList: item.targetClassList || ''
        })
    }))
}

function pageExposureLogTransformer(
    origin: IBaseBreadCrumbItem[]
) {
    return origin.map((item) => ({
        page_exposure: item.page_exposure,
        stack: item.stack,
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

    if (['pv', 'uv'].includes(indicatorName)) {
        return []
    } else if (indicatorName === 'click') {
        return clickLogTransformer(originCollectedData as IBaseClickElementInfo[])
    } else if (indicatorName === 'page_exposure') {
        return pageExposureLogTransformer(originCollectedData as IBaseBreadCrumbItem[])
    } else if (indicatorName === 'module_exposure') {
        // TODO: 模块曝光的日志清洗
        return []
    }

    return []
}
