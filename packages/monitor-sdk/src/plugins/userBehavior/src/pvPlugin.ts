import { IBasePlugin } from "monitor-sdk/src";
import { IPluginTransportDataBaseInfo, RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";

const PvPlugin: IBasePlugin<'userBehavior', 'pv'> = {
    eventTypeName: 'userBehavior',
    indicatorName: 'pv',
    monitor(client, notify) {
        client.eventBus.subscribe('onPushAndReplaceState', () => {
            const originalData: IPluginTransportDataBaseInfo<'pv'> = {
                ...getUrlTimestamp(),
                data: null
            }
            notify('pv', originalData)
        })
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            eventTypeName: 'userBehavior',
            indicatorName: 'pv',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, transformedData) {
        transport.throttledPreLoadRequest({
            sendData: transformedData,
            priority: RequestBundlePriorityEnum.USERBEHAVIOR,
        })
    },
}

export default PvPlugin