import { IBasePlugin } from "monitor-sdk/src";
import { IPluginTransportDataBaseInfo, RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";

const PvPlugin: IBasePlugin<'userBehavior'> = {
    type: 'userBehavior',
    eventName: 'pv',
    monitor(client, notify) {
        client.eventBus.subscribe('onPushAndReplaceState', () => {
            const originalData: IPluginTransportDataBaseInfo<'pv'> = getUrlTimestamp()
            notify('pv', originalData)
        })
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'

        return {
            type: 'userBehavior',
            eventName: 'pv',
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