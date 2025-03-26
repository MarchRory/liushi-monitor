import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction } from "monitor-sdk/src/utils/common";
import { setStorage } from "monitor-sdk/src/core/IndicatorStorageCenter";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";
import { getUvRecordStorage } from "./utils/storage";
import { UV_RECORD_STORAGE_KEY } from "monitor-sdk/src/configs/constant";

const UvPlugin: IBasePlugin<'userBehavior'> = {
    type: 'userBehavior',
    eventName: 'uv',
    monitor(client, notify) {
        const todayUvRecordMap = getUvRecordStorage()
        const recordUv = () => {
            const url = getCurrentUrl().split('?')[0]
            if (todayUvRecordMap.has(url)) return

            todayUvRecordMap.add(url)
            const sendData = { url, timestamp: getCurrentTimeStamp() }
            notify('uv', sendData)
        }
        client.eventBus.subscribe('onPushAndReplaceState', recordUv)
        client.eventBus.subscribe('onBeforePageUnload', () => setStorage(
            UV_RECORD_STORAGE_KEY,
            JSON.stringify({
                timestamp: getCurrentTimeStamp(),
                uvRecord: Array.from(todayUvRecordMap)
            })
        ))
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            type: 'userBehavior',
            eventName: 'uv',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, encryptedData) {
        transport.preLoadRequest({
            priority: RequestBundlePriorityEnum.USERBEHAVIOR,
            sendData: encryptedData,
            customCallback: [{
                handleCustomSuccess(...args) {
                    console.log('uv发送成功')
                },
            }]
        })
    },
}

export default UvPlugin