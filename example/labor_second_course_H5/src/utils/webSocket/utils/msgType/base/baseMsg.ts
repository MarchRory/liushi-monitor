import { wsDataType } from "@/utils/webSocket/types/ws";
import { msgType } from "../../../types/eventType";
import { mySocket } from "../../../useSocket";
enum TypeMap {
    reconnect = 1,                    // 断线重连
}


export function subscribeBaseType(wsInstance: mySocket): Map<string | number, Function> {
    const baseEventMap = new Map()
    const typesObj: msgType[] = [
        {
            type: TypeMap.reconnect,
            callback: (newInstance: mySocket) => {
                wsInstance = newInstance
            }
        },
    ]
    if (typesObj.length) {
        typesObj.forEach((eventItem: msgType) => {
            baseEventMap.set(eventItem.type, eventItem.callback)
        })
    }
    return baseEventMap
}