import {
    PathStack as PathSttackModel,
    Exposure as ExposureModel,
    Interaction as InteractionModel
} from '.prisma/client'

export type UserBehaviorEventTypes =
    'pv'
    | 'uv'
    | 'page_exposure'
    | 'module_exposure'
    | "defaultClick"
    | "compClick"

export type IDefaultClickInfo = {
    clientX: number
    clientY: number
}

export type IBaseClickElementInfo = IDefaultClickInfo & {
    [key: string]: any
    /**
     * CSS选择器定位
     */
    targetClassList: string[]
    /**
     * 标签名
     */
    nodeName: Element['tagName']
    /**
     * 元素的内置文本
     */
    innerText: string
}

export type IBaseBreadCrumbItem = {
    /**
     * 页面路径
     */
    url: string
    /**
     * 页面访问路径, 记录从当前页面开始, 一直访问子页面直到回到当前页面并退出的整个过程中，用户依次访问的页面url
     */
    stack: string[]
    /**
     * 从前置页面进入当前页面的时间戳
     */
    enter_time: number
    /**
     * 从当前页面返回，回到前置页面的时间戳
     */
    leave_time: number
    /**
     * 当前页面及其包括内容的整体曝光时间（包括当前页面的子页面）
     */
    page_exposure: number
}

export type BehaviorCollectedType<T extends UserBehaviorEventTypes = UserBehaviorEventTypes> =
    T extends 'defaultClick' | "compClick" ? IDefaultClickInfo | IBaseClickElementInfo : never

export type TransformedBehaviorData =
    Pick<PathSttackModel, 'stack'>
    // | Pick<ExposureModel, 'value'>
    | Pick<IBaseBreadCrumbItem, 'page_exposure' | "stack" | "url">
    | Pick<InteractionModel, 'pageX' | 'pageY' | "nodeName" | "featureInfo" | "componentTypeId">