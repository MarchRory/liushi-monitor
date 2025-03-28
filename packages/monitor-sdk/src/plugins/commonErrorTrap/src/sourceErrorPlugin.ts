import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { ISourceErrorTarget, SourceErrorTransportData } from "./types/error";

const SourceErrorPlugin: IBasePlugin<'error'> = {
    type: 'error',
    eventName: 'source_load_error',
    monitor(_, notify) {
        const sourceErrorHandler = (ev: WindowEventMap['error']) => {
            const { attributes, nodeName } = ev.target as ISourceErrorTarget
            const sourceElementattributes: SourceErrorTransportData['data']['attributes'] = []
            for (const attr of attributes) {
                sourceElementattributes.push({
                    name: attr.name,
                    value: attr.value
                })
            }
            const originalData: SourceErrorTransportData = {
                ...getUrlTimestamp(),
                data: {
                    nodeName: nodeName.toLowerCase(),
                    attributes: sourceElementattributes
                }
            }
            notify('source_load_error', originalData)
        }
        window.addEventListener('error', sourceErrorHandler, true)
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            type: 'error',
            eventName: 'source_load_error',
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
                    console.log('资源加载错误数据发送成功')
                },
            }]
        })
    },
}

export default SourceErrorPlugin