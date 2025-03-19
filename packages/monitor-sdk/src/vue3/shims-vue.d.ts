import 'vue'
import Vue3AppMonitorClient from './src/client/client'

declare module 'vue' {
    export interface ComponentCustomProperties {
        $liushiMonitor: Omit<Vue3AppMonitorClient, 'VueApp'>
    }
}