import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { JsSyncErrorTransportData } from "./types/error";

/**
 * 无法捕获异步错误
 */
const JavaScriptErrorPlugin: IBasePlugin<'error', 'javaScript_sync_error'> = {
    eventTypeName: 'error',
    indicatorName: 'javaScript_sync_error',
    monitor(client, notify) {
        const jsSyncErrorHandler = (...args: Parameters<OnErrorEventHandlerNonNull>[]) => {
            const errorDetail: JsSyncErrorTransportData['data']['syncError'] = []
            args.forEach((errorItem) => {
                const [errorEvent, sourceFile, codeLine, codeColumn, stackDetail] = errorItem
                errorDetail.push({
                    errorEvent,
                    sourceFile,
                    codeLine,
                    codeColumn,
                    stackDetail: {
                        message: stackDetail?.message,
                        stack: stackDetail?.stack
                    }
                })
            })

            const originalData: JsSyncErrorTransportData = {
                ...getUrlTimestamp(),
                data: {
                    syncError: errorDetail.slice()
                }
            }
            notify('javaScript_sync_error', originalData)
        }
        client.eventBus.subscribe('onJavaScriptSyncError', jsSyncErrorHandler)
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            eventTypeName: 'error',
            indicatorName: 'javaScript_sync_error',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, encryptedData) {
        transport.preLoadRequest({
            priority: RequestBundlePriorityEnum.ERROR,
            sendData: encryptedData,
        })
    },
}

export default JavaScriptErrorPlugin