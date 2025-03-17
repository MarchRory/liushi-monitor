import { mySocket, useWebSocket } from "./useSocket";
import { subscribeBaseType } from './utils/msgType/base/baseMsg'
import { subscribeCourseType } from './utils/msgType/course/courseMsg'
const socket = ref<mySocket>()
/**
 * 初始化websocket
 * @returns mySocket 实例, 响应式的
 */
export const initMyWebSocket = () => {
    socket.value = useWebSocket()
    const myWSIntance = socket.value
    const baseMsgMap = subscribeBaseType(myWSIntance)
    const courseMsgMap = subscribeCourseType(myWSIntance)
    socket.value.mount(new Map([...baseMsgMap, ...courseMsgMap]))
    return socket.value
}