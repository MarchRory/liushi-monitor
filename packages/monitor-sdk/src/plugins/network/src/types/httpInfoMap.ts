export interface IHttpMemoryValue {
    requestMemoryInfo: {
        method: string
        originRequestType: 'fetch' | 'xhr',
        startTime: number
    },
}