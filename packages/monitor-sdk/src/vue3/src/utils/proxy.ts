import { Vue3BreadCrumbClient } from "../client/Vue3BreadCrumbClient";
import { HistoryParams, IHistoryStateValue } from "../types/types";


/**
 * 在pushState、replaceState中专注于页面 进入时 的访问路径信息收集
 * @param args pushState、replaceState 原生参数
 * @param breadCrumbClient 
 */
export function pushStateBreadCrumbProxy(nativeFn: History['pushState'], breadCrumbClient: Vue3BreadCrumbClient) {
    return function (this: History, ...args: Parameters<typeof nativeFn>) {
        // TODO: 用一个元祖约束下面的args解构后的数组
        const [state] = args as HistoryParams
        breadCrumbClient.debouncedPushRecord({
            from: state.current,
            to: ""
        })
        return nativeFn.apply(this, args)
    }
}

/**
 * vue-router底层的back是直接调用的history.back, 这个方法会触发popState, 而popState是异步的,
 * 所以重写onpopstate监听方法就可以捕获到页面回退
 * @param nativeFn 
 * @param breadCrumbClient 
 * @returns 
 */
export function popStateBreadCrumbProxy(nativeFn: Window['onpopstate'], breadCrumbClient: Vue3BreadCrumbClient) {
    return function (this: WindowEventHandlers, args: typeof nativeFn extends null ? any[] : PopStateEvent) {
        const { current, forward } = args.state as IHistoryStateValue
        breadCrumbClient.debouncedPopRecord({
            from: forward,
            to: current
        })
        if (nativeFn) {
            return nativeFn.apply(this, [args])
        }
    }
}