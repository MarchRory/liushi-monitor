import { BaseEventTypes } from "../types"

type CallBack = (data: any) => void

/**
 * @description 利用发布订阅实现对埋点收集、数据清洗、上报
 */
export class Subscribe<T = BaseEventTypes> {
    private bucket: Map<T, CallBack[]> = new Map()
    constructor() { }
    /**
     * 订阅事件
     * @param eventName 
     * @param callback 
     */
    subscribe(eventName: T, callback: CallBack) {
        const deps = this.bucket.get(eventName)
        if (deps) {
            deps.push(callback)
        } else {
            this.bucket.set(eventName, [callback])
        }
    }
    /**
     * 触发数据处理和上报
     * @param eventName 
     * @param args 
     */
    notify(eventName: T, args?: any) {
        const deps = this.bucket.get(eventName)
        if (deps && deps.length) {
            deps.forEach(cb => {
                // 调用上报包裹器进行响应和错误捕获
                cb && cb(args)
            })
        }
    }
}