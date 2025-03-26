import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction } from "monitor-sdk/src/utils/common";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";

const PvPlugin: IBasePlugin<'userBehavior'> = {
    type: 'userBehavior',
    eventName: 'pv',
    monitor(client, notify) {
        const getPv = () => {
            const url = getCurrentUrl()
            const timestamp = getCurrentTimeStamp()
            const collectedData = { url, timestamp, type: 'userBehavior', eventName: 'pv' }
            return collectedData
        }
        client.eventBus.subscribe('onPushAndReplaceState', () => {
            const pvData = getPv()
            notify('pv', pvData)
        })
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'

        return {
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, encryptedData) {
        transport.throttledPreLoadRequest({
            sendData: encryptedData,
            priority: RequestBundlePriorityEnum.USERBEHAVIOR,
            customCallback: [{
                handleCustomSuccess(...args) {
                    console.log('pv发送成功')
                },
            }]
        })
    },
}

export default PvPlugin