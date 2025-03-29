import { BaseBreadCrumb, BaseTransport, Subscribe } from "monitor-sdk/src/core";
import { GlobalSubscribeTypes, IBaseBreadCrumbOptions, MonitorTypes } from "monitor-sdk/src/types";
import { HistoryParams, IHistoryStateValue } from "../types/types";

export class Vue3BreadCrumbClient extends BaseBreadCrumb {
    private readonly eventBus: Subscribe<GlobalSubscribeTypes<MonitorTypes>>
    constructor(initialOptions: {
        baseTransport: BaseTransport,
        eventBus: Subscribe<GlobalSubscribeTypes<MonitorTypes>>
        options?: IBaseBreadCrumbOptions,
    }) {
        super(initialOptions)
        this.eventBus = initialOptions.eventBus
        this.init()
    }
    init() {
        // Vue-router底层通过调用history.pushState和history.replaceState实现页面前进和替换，
        // 使用history.popState实现页面的回退
        // 故通过切面编程收集到路径栈信息
        this.eventBus.subscribe('onPushAndReplaceState', (args: HistoryParams) => {
            const [state] = args
            this.debouncedPushRecord({
                from: state.current,
                to: ""
            })
        })
        this.eventBus.subscribe('onPopState', (args: PopStateEvent) => {
            if (args.state) {
                const { current, forward } = args.state as IHistoryStateValue
                this.debouncedPopRecord({
                    from: forward,
                    to: current
                })
            }
        })
    }
}