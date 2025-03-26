import { IBasePlugin } from "monitor-sdk/src";
import { DEFAULT_CLICK_COUNT_WHEN_TRANSPORT, DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT } from "monitor-sdk/src/configs/constant";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction } from "monitor-sdk/src/utils/common";
import { isUndefined } from "monitor-sdk/src/utils/is";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { IBaseClickElementInfo, IDefaultClickInfo } from "./types/click";
import { getCurrentUrl } from "monitor-sdk/src/utils/url";

const ClickPlugin: IBasePlugin<'userBehavior'> = {
    type: 'userBehavior',
    eventName: "click",
    monitor(client, notify) {
        const {
            isDefaultClickMonitorDisabled = false,
            customClickMonitorConfig,
            clickMonitorClassName = ""
        } = client.options.userInteractionMonitorConfig || {}

        let defaultClickRecord: null | IDefaultClickInfo[] = isDefaultClickMonitorDisabled ? null : []
        if (!isDefaultClickMonitorDisabled) {
            // 点击任意地方, 获取坐标
            const anywhereClickMonitor = (ev: MouseEvent) => {
                // 没收集到足够的数据则暂时不上报
                if (defaultClickRecord && defaultClickRecord?.length < DEFAULT_CLICK_COUNT_WHEN_TRANSPORT) {
                    const { clientX, clientY } = ev
                    defaultClickRecord.push({
                        url: getCurrentUrl(),
                        timestamp: getCurrentTimeStamp(),
                        clientY,
                        clientX
                    })
                }

                // 收集量达标则上报
                if (defaultClickRecord && defaultClickRecord?.length === DEFAULT_CLICK_COUNT_WHEN_TRANSPORT) {
                    notify('click', { clickRecord: defaultClickRecord.slice() })
                    defaultClickRecord = []
                }
            }
            client.eventBus.subscribe('click', anywhereClickMonitor)

            // 页面关闭前进行未上报数据缓存
            const unloadHandler = () => {
                if (defaultClickRecord?.length) {
                    const str = JSON.stringify(defaultClickRecord)
                    client.storageCenter.handleSaveBeforeUnload(RequestBundlePriorityEnum.USERBEHAVIOR, [str])
                }
            }
            client.eventBus.subscribe('onBeforePageUnload', unloadHandler)
        }

        // 元素点击监听
        if (!clickMonitorClassName && (isUndefined(customClickMonitorConfig) || !customClickMonitorConfig.size)) return

        const customMonitorClassNames = Array.from((customClickMonitorConfig?.keys() || []))
        let clickElementRecord: IBaseClickElementInfo[] = []
        const filterSubClassNames = (classList: DOMTokenList) => {
            return customMonitorClassNames.filter((className) => classList.contains(className))
        }
        const clickElementHander = (ev: MouseEvent) => {
            if (clickElementRecord.length < DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT) {
                const { clientX, clientY, target } = ev
                const { classList, innerText = "", localName = "unknown" } = target as EventTarget

                // 非埋点元素不进行数据收集
                if (!classList.contains(clickMonitorClassName)) return
                // 收集用户自定义数据
                let extraCustomData: object = {}
                const includesCustomMonitorClassNames = filterSubClassNames(classList)
                if (includesCustomMonitorClassNames.length) {
                    for (const className of includesCustomMonitorClassNames) {
                        const collector = customClickMonitorConfig?.get(className)
                        if (!collector) continue
                        Object.assign(extraCustomData, collector(ev));
                    }
                }
                const collectedData: IBaseClickElementInfo = {
                    url: getCurrentUrl(),
                    timestamp: getCurrentTimeStamp(),
                    clientX,
                    clientY,
                    innerText: innerText,
                    targetClassList: Array.from(classList || []) as unknown as string[],
                    tagName: localName,
                    ...extraCustomData
                }
                clickElementRecord.push(collectedData)
            }

            if (clickElementRecord.length >= DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT) {
                notify('click', clickElementRecord.slice())
                clickElementRecord = []
            }
        }
        client.eventBus.subscribe('click', clickElementHander)
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            type: 'userBehaivor',
            eventName: 'click',
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
                    console.log('click监控数据发送成功')
                },
            }]
        })
    },
}

export default ClickPlugin