export interface Observer {
    update: () => void
}

/**
 * @description 观察者模式
 * @example XdLogger
 */
export class ObserverMode {
    private observers: Observer[]
    constructor() {
        this.observers = []
    }

    /**
     * @description 挂载观察者
     * @param observer 
     */
    addObserver(observer: Observer) {
        this.observers.push(observer)
    }

    /**
     * @description 因为logger卸载发生在退出登录, 所以移除时候就全部移除
     */
    removeObserver() {
        this.observers = []
    }

    notifyObserver() {
        // 非请求状态时再触发
        this.observers.forEach((observer) => {
            observer.update && observer.update()
        })
    }
}
