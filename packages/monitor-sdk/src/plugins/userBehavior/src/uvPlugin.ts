import { IBasePlugin } from "monitor-sdk/src";
import { IPluginTransportDataBaseInfo, RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { setStorage } from "monitor-sdk/src/core/IndicatorStorageCenter";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";
import { getUvRecordStorage } from "./utils/storage";
import { UV_RECORD_STORAGE_KEY } from "monitor-sdk/src/configs/constant";

const UvPlugin: IBasePlugin<'userBehavior', 'uv'> = {
    type: 'userBehavior',
    eventName: 'uv',
    monitor(client, notify) {
        // const todayUvRecordMap = getUvRecordStorage()
        // const recordUv = () => {
        //     const url = getCurrentUrl().split('?')[0]
        //     if (todayUvRecordMap.has(url)) return

        //     todayUvRecordMap.add(url)
        //     const originalData: IPluginTransportDataBaseInfo<'uv'> = {
        //         ...getUrlTimestamp(),
        //         data: null
        //     }
        //     notify('uv', originalData)
        // }
        // client.eventBus.subscribe('onPushAndReplaceState', recordUv)
        // window.addEventListener('beforeunload', () => setStorage(
        //     UV_RECORD_STORAGE_KEY,
        //     JSON.stringify({
        //         timestamp: getCurrentTimeStamp(),
        //         uvRecord: Array.from(todayUvRecordMap)
        //     })
        // ))
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
        })
    },
}

export default UvPlugin