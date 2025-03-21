import { BaseBreadCrumb, BaseTransport } from "monitor-sdk/src/core";
import { IBaseBreadCrumbOptions } from "monitor-sdk/src/types";
import { aop } from "monitor-sdk/src/utils/aop";
import { StorageCenter } from "monitor-sdk/src/utils/storage";
import { popStateBreadCrumbProxy, pushStateBreadCrumbProxy } from "../utils/proxy";
import { HistoryParams } from "../types/types";

export class Vue3BreadCrumbClient extends BaseBreadCrumb {
    constructor(initialOptions: {
        baseTransport: BaseTransport,
        storageCenter: StorageCenter,
        options?: IBaseBreadCrumbOptions,
    }) {
        super(initialOptions)
        this.init()
    }
    init() {
        // Vue-router底层通过调用history.pushState和history.replaceState实现跳转
        // 通过切面编程收集到路径栈信息
        aop(window.history, 'pushState', (nativeFn: History['pushState']) => pushStateBreadCrumbProxy(nativeFn, this, 'pushState'))
        aop(window.history, 'replaceState', (nativeFn: History['replaceState']) => pushStateBreadCrumbProxy(nativeFn, this, 'replaceState'))
        aop(window, 'onpopstate', (nativeFn: Window['onpopstate']) => popStateBreadCrumbProxy(nativeFn, this))
    }
}