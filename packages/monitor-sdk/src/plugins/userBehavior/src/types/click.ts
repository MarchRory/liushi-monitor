export interface IDefaultClickInfo {
    url: string
    timestamp: number
    clientX: number
    clientY: number
}

export interface IBaseClickElementInfo extends IDefaultClickInfo {
    [key: string]: any
    /**
     * CSS选择器定位
     */
    targetClassList: string[]
    /**
     * 标签名
     */
    tagName: Element['tagName']
    /**
     * 元素的内置文本
     */
    innerText: string
}

declare global {
    interface EventTarget {
        classList: DOMTokenList
        className: string
        innerText: string
        localName: string
    }
}

export { }