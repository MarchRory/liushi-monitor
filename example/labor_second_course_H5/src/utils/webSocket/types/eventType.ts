const baseWebSocketType = ['reconnect']
const msgEventType: any = []

export interface msgType {
    type: string | number
    callback: Function
}

export const eventType = [...baseWebSocketType, ...msgEventType]