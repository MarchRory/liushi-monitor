import { IBasePlugin } from "monitor-sdk/src";
import { DEFAULT_CLICK_COUNT_WHEN_TRANSPORT, DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT } from "monitor-sdk/src/configs/constant";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { isUndefined } from "monitor-sdk/src/utils/is";
import {
    ClickElementTransportData,
    DefaultClickTransportData,
    IBaseClickElementInfo,
    IClickElementEventTarget,
    IDefaultClickInfo
} from "./types/click";

const ClickPlugin: IBasePlugin<'userBehavior', 'compClick'> = {
    eventTypeName: 'userBehavior',
    indicatorName: 'compClick',
    monitor(client, notify) {
        const {
            customClickMonitorConfig,
            clickMonitorClassName = ""
        } = client.options.userInteractionMonitorConfig || {}


        if (!clickMonitorClassName && (isUndefined(customClickMonitorConfig) || !customClickMonitorConfig.size)) return

        const customMonitorClassNames = Array.from((customClickMonitorConfig?.keys() || []))
        let clickElementRecord: IBaseClickElementInfo[] = []
        const filterSubClassNames = (classList: DOMTokenList) => {
            return customMonitorClassNames.filter((className) => classList.contains(className))
        }

        let notifyInterval: NodeJS.Timeout | null = null
        let isReporting = false
        const report = () => {
            if (isReporting || clickElementRecord.length === 0) return

            isReporting = true
            const originalData: ClickElementTransportData = {
                ...getUrlTimestamp(),
                data: clickElementRecord.slice()
            }
            notify('compClick', originalData)
            clickElementRecord = []
            isReporting = false
        }
        const clickElementHander = (ev: MouseEvent) => {
            if (clickElementRecord.length < DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT) {
                const { pageX, pageY, target } = ev
                const { classList, innerText = "", nodeName = "unknown" } = target as IClickElementEventTarget

                // 非埋点元素不进行数据收集
                if (!classList.contains(clickMonitorClassName)) return
                // 收集用户自定义数据
                let extraCustomData: object = {}
                const includesCustomMonitorClassNames = filterSubClassNames(classList)
                if (includesCustomMonitorClassNames.length) {
                    for (const className of includesCustomMonitorClassNames) {
                        const collector = customClickMonitorConfig?.get(className)
                        if (collector) {
                            Object.assign(extraCustomData, collector(ev));
                        }
                    }
                }
                const clickElementInfo: IBaseClickElementInfo = {
                    pageX,
                    pageY,
                    innerText: innerText,
                    targetClassList: Array.from(classList || []) as unknown as string[],
                    nodeName: nodeName.toLowerCase(),
                    ...extraCustomData
                }
                clickElementRecord.push(clickElementInfo)
            }

            // 收集满时自动触发上报
            if (clickElementRecord.length >= DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT) {
                report()
            }
        }

        client.eventBus.subscribe('onClick', clickElementHander)

        // 定时每30s自动上报
        notifyInterval = setInterval(() => report(), 1000 * 30)

        window.addEventListener(
            'beforeunload',
            async () => {
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
            indicatorName: 'compClick',
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