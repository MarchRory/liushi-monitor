import { IBasePlugin } from "monitor-sdk/src";
import { DEFAULT_CLICK_COUNT_WHEN_TRANSPORT } from "monitor-sdk/src/configs/constant";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import {
    DefaultClickTransportData,
    IDefaultClickInfo
} from "./types/click";

const ClickPlugin: IBasePlugin<'userBehavior', 'defaultClick'> = {
    eventTypeName: 'userBehavior',
    indicatorName: 'defaultClick',
    monitor(client, notify) {
        const {
            isDefaultClickMonitorDisabled = false,
        } = client.options.userInteractionMonitorConfig || {}

        if (isDefaultClickMonitorDisabled) return

        let defaultClickRecord: IDefaultClickInfo[] = []
        let isReporting = false
        let notifyInterval: NodeJS.Timeout | null = null

        const report = () => {
            if (isReporting || defaultClickRecord.length === 0) return

            isReporting = true
            const originalData: DefaultClickTransportData = {
                ...getUrlTimestamp(),
                data: defaultClickRecord.slice()
            }
            notify('defaultClick', originalData)
            defaultClickRecord = []
            isReporting = false
        }
        // 点击任意地方, 获取坐标
        const anywhereClickMonitor = (ev: MouseEvent) => {
            // 没收集到足够的数据则暂时不上报
            if (defaultClickRecord?.length < DEFAULT_CLICK_COUNT_WHEN_TRANSPORT) {
                const { pageX, pageY } = ev
                defaultClickRecord.push({
                    pageX, pageY
                })
            }

            // 收集满时自动触发上报
            if (!isReporting && defaultClickRecord?.length >= DEFAULT_CLICK_COUNT_WHEN_TRANSPORT) {
                report()
            }
        }

        client.eventBus.subscribe('onClick', anywhereClickMonitor)

        // 定时每30s自动上报
        notifyInterval = setInterval(() => report(), 1000 * 30)

        window.addEventListener(
            'beforeunload',
            () => {
                notifyInterval && clearInterval(notifyInterval)
            },
            { capture: true }
        )
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            eventTypeName: 'userBehavior',
            indicatorName: 'defaultClick',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, transformedData) {
        transport.preLoadRequest({
            textType: 'plaintext',
            priority: RequestBundlePriorityEnum.USERBEHAVIOR,
            sendData: transformedData,
        })
    },
}

export default ClickPlugin