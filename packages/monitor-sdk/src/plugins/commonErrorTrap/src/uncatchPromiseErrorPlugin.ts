import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { UnCatchPromiseErrorTransportData } from "./types/error";

const UnCatchPromiseErrorPlugin: IBasePlugin<'error'> = {
    type: 'error',
    eventName: 'uncatch_promise_error',
    monitor(_, notify) {
        window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
            const { reason } = ev
            const errorData: UnCatchPromiseErrorTransportData = {
                ...getUrlTimestamp(),
                data: { reason: { message: reason.message, stack: reason.stack } }
            }
            notify('uncatch_promise_error', errorData)
        })
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            type: 'error',
            eventName: 'uncatch_promise_error',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, encryptedData) {
        transport.preLoadRequest({
            priority: RequestBundlePriorityEnum.ERROR,
            sendData: encryptedData,
            customCallback: [{
                handleCustomSuccess(...args) {
                    console.log('uncatch_promise_error监控数据发送成功')
                },
            }]
        })
    },
}

export default UnCatchPromiseErrorPlugin