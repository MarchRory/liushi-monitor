import { ISDKInitialOptions } from "../types";
import Vue3AppMonitorClient from "./src/client/client";
import Vue3ErrorMonitorPlugin from "./src/plugin/errorTrapMonitorPlugin";

import type { App } from 'vue'
/**
 * 注册监控插件
 */
function install(vue3App: App, options: ISDKInitialOptions): void {
    const monitorInstance = new Vue3AppMonitorClient({ ...options, VueApp: vue3App })
    const { customPlugins = [] } = options
    const plugins = [Vue3ErrorMonitorPlugin, ...customPlugins]
    monitorInstance.use(plugins)
    vue3App.config.globalProperties.$liushiMonitor = monitorInstance
}


export {
    install
}
