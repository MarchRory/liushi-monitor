export interface webSocketBucketType {
    bucket: Map<number | string, Function>
    addEvent: Function
    useMethod: Function
    clear: Function
}