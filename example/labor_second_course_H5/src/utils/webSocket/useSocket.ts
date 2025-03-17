import { wsDataType } from "./types/ws"
import { ref } from "vue"
import { useWsStore } from "@/store/modules/ws"
import { getToken } from "../auth/auth"
import { webSocketBucketType } from './types/bucket'
import { courseStateChangeType, courseTypeMap } from './utils/msgType/course/courseMsg'
import { showFailToast, showToast } from "vant"
const DEFAULT_WS_URL = import.meta.env.VITE_APP_WS_URL        // ws url
const DEFAULT_HEART_BEAT_INTERVAL = 15 * 1000                 // 心跳间隔
const DEFAULT_RETRIES_CNT = 5                                 // 断线默认重连次数
const DEFAULT_CHECK_TEXT = 'ping'                             // 心跳检测默认文案
const courseStatusChange = courseTypeMap.courseStateChange          // 课程状态改变的type, 和coursecourseTypeMap中那个一样, 
const wsStore = ref()
export class WebSocketEventBucket implements webSocketBucketType {
    bucket = new Map<number | string, Function>()
    addEvent(type: number | string, callback: Function) {
        this.bucket.set(type, callback)
    }
    useMethod(type: number | string | courseTypeMap, e: wsDataType | mySocket) {
        if (courseStateChangeType.includes(type as courseTypeMap)) {
            this.bucket.get(courseStatusChange)?.(e)
        } else {
            this.bucket.get(type)?.(e)
        }

    }
    clear() {
        this.bucket.clear()
    }
}

export class mySocket extends WebSocket {
    heartInterval: NodeJS.Timer | number | null = 0
    $bucket: webSocketBucketType | null = null
    constructor(bucket: webSocketBucketType | null = new WebSocketEventBucket, receivedURL?: string) {
        let wsURL = `${receivedURL ? receivedURL : DEFAULT_WS_URL}?swpu_token=${getToken()}`
        super(wsURL)
        this.$bucket = bucket
        this.initSocket()
    }

    subscribe(type: string | number, callback: Function) {
        this.$bucket?.addEvent(type, callback)
    }

    initSocket() {
        let that = this
        // 监听连接
        super.onopen = function (e) {
            wsStore.value = useWsStore()
            console.log('websocket连接成功')
            that.heartBeatCheck()
        }
        // 监听断开
        super.onclose = (e) => {
            if (!wsStore.value.isUserQuit) {
                if (wsStore.value.$retryCnt < DEFAULT_RETRIES_CNT) {
                    wsStore.value.$retryCnt++
                    console.log('websocket连接断开: ', e)
                    const socket = new mySocket(this.$bucket)
                    that.$bucket?.useMethod(1, socket)
                } else {
                    that.closeLink()
                    showFailToast('WebSocket异常')
                }
            }
        }
        // 监听错误
        super.onerror = (err) => {
            console.log('ws出错: ', err)
        }
        // 监听消息
        super.onmessage = (e) => {
            that.receiveMesaage(e)
        }
    }

    // 发送事件
    sendMessage(msg: string) {
        try {
            super.send(msg)
        } catch (e) {
            console.log('msgErr: ', e)
        }

    }

    receiveMesaage(e) {
        // 这里我直接取的e.data用，对其他的数据有需求需要从e里面拿
        const data = JSON.parse(e.data)
        // console.log('接收到消息: ', data)
        const wsData: wsDataType = data
        if (!wsData) {
            return;
        }
        const { state } = wsData
        if (state > 0) {
            if (wsData.type != 1) {
                //  非心跳信息
                this.$bucket?.useMethod(wsData.type, wsData)
            }
        } else if (state == 0) {
            showFailToast(wsData.message as string)
        } else {
            showToast(wsData.message as string)
        }
    }

    heartBeatCheck() {
        this.heartInterval = setInterval(() => {
            this.sendMessage(DEFAULT_CHECK_TEXT)
        }, DEFAULT_HEART_BEAT_INTERVAL)
    }
    stopHeartBeatCheck() {
        clearInterval(this.heartInterval as NodeJS.Timer)
        this.heartInterval = null
        console.log('heartEnd: ', this.heartInterval)
    }
    closeLink() {
        this.stopHeartBeatCheck()
        super.close(1000)
        this.$bucket?.clear()
        this.$bucket = null
    }
    // 批量订阅
    mount(EventMap: Map<number | string, Function>) {
        let that = this
        EventMap.forEach((callback: Function, msgType: string | number) => {
            that.subscribe(msgType, callback)
        })
    }
}
export const useWebSocket = (): mySocket => {
    const bucket = new WebSocketEventBucket()
    return new mySocket(bucket)
}