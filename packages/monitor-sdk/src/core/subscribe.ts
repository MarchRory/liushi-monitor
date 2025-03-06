import { BaseEventTypes, IBasePlugin } from "../types"

type MonitorCallBack = (data: any) => void

/**
 * @description 利用发布订阅实现对埋点收集、数据清洗、上报
 */
export class Subscribe<T extends BaseEventTypes = BaseEventTypes> {
    private bucket: Map<T, MonitorCallBack[]> = new Map()
    constructor() { }
    subscribe(eventName: T, callback: MonitorCallBack) {
        const deps = this.bucket.get(eventName)
        if (deps) {
            deps.push(callback)
        } else {
            this.bucket.set(eventName, [callback])
        }
    }
    notify(eventName: T, data: any) {
        const deps = this.bucket.get(eventName)
        if (deps && deps.length) {
            deps.forEach(cb => {
                // 调用上报包裹器进行响应和错误捕获
            })
        }
    }
}