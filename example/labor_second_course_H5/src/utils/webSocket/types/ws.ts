export interface mySocketOptions {
    beatInterval: number
    retry: number
    checkText: string
}

export interface wsDataType<T = any> {
    type: number | string
    state: number
    message?: string
    data: T
    time: number
}