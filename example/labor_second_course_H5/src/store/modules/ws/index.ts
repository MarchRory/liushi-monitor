import { defineStore } from "pinia";
import { mySocket } from "@/utils/webSocket/useSocket";
import { initMyWebSocket } from "@/utils/webSocket/index";
interface MyWSType {
    wsInstance: mySocket | null,
    $retryCnt: number
    isUserQuit: boolean
}
export const useWsStore = defineStore("useWxStore", {
    state: (): MyWSType => {
        return {
            wsInstance: null,
            $retryCnt: 0,
            isUserQuit: false
        };
    },
    actions: {
        initWs() {
            if (!this.wsInstance) {
                this.isUserQuit = false
                this.$retryCnt = 0
                this.wsInstance = initMyWebSocket()
            } else {
                let protoType = Object.prototype.toString.call(this.wsInstance)
                if (protoType !== '[object WebSocket]') {   // 热更新和页面刷新导致自己封装的websocket断开的解决策略
                    this.wsInstance = null
                    this.$retryCnt = 0
                    this.initWs()
                }
            }
        },
        closeWebSocket() {
            let protoType = Object.prototype.toString.call(this.wsInstance)
            if (this.wsInstance && protoType === '[object WebSocket]') {
                this.wsInstance.closeLink();
            }
            this.isUserQuit = true
            this.wsInstance = null

        }
    },
    getters: {},
    persist: true, // 持久化
});