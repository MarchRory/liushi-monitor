import { IPluginTransportDataBaseInfo } from "monitor-sdk/src/types"

export interface IDefaultClickInfo {
    pageX: number
    pageY: number
}
export type DefaultClickTransportData = IPluginTransportDataBaseInfo<'defaultClick', IDefaultClickInfo[]>

export interface IBaseClickElementInfo extends IDefaultClickInfo {
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
export type ClickElementTransportData = IPluginTransportDataBaseInfo<"compClick", IBaseClickElementInfo[]>

export interface IClickElementEventTarget extends EventTarget {
    classList: DOMTokenList
    className: string
    innerText: string
    nodeName: Uppercase<string>
}