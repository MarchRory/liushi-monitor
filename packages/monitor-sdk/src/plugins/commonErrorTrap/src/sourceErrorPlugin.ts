import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { ISourceErrorTarget, SourceErrorTransportData } from "./types/error";

const SourceErrorPlugin: IBasePlugin<'error', 'source_load_error'> = {
    type: 'error',
    eventName: 'source_load_error',
    monitor(_, notify) {
        const sourceErrorHandler = (ev: WindowEventMap['error']) => {
            const { attributes, nodeName } = ev.target as ISourceErrorTarget

            const sourceElementattributes: SourceErrorTransportData['data']['attributes'] = []
            try {
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
            } catch (err) {
                notify('source_load_error', {
                    ...getUrlTimestamp(),
                    data: err as SourceErrorTransportData
                })
            }
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
            textType: 'plaintext',
            priority: RequestBundlePriorityEnum.ERROR,
            sendData: encryptedData,
        })
    },
}

export default SourceErrorPlugin