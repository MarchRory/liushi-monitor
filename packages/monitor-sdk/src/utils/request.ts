import type { IProcessingRequestRecord, RequestBundlePriorityEnum } from "../types/transport";

/**
 * 虚拟请求, 用于SDK调试模式
 * @param data 
 * @returns 
 */
export function fakeRequest(
    url: string,
    data: Partial<Record<RequestBundlePriorityEnum, IProcessingRequestRecord<'plaintext'>['data']>>
) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('数据模拟上报成功: url=' + url + " data=" + data)
            resolve(undefined)
        }, 500 * (1 + Math.random()))
    })
}