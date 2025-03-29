import { IBasePlugin } from "monitor-sdk/src";
import { DEFAULT_CLICK_COUNT_WHEN_TRANSPORT, DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT } from "monitor-sdk/src/configs/constant";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { isUndefined } from "monitor-sdk/src/utils/is";
import { ClickElementTransportData, DefaultClickTransportData, IBaseClickElementInfo, IClickElementEventTarget, IDefaultClickInfo } from "./types/click";

const ClickPlugin: IBasePlugin<'userBehavior', 'click'> = {
    type: 'userBehavior',
    eventName: "click",
    monitor(client, notify) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'

        const {
            isDefaultClickMonitorDisabled = false,
            customClickMonitorConfig,
            clickMonitorClassName = ""
        } = client.options.userInteractionMonitorConfig || {}

        let defaultClickRecord: null | IDefaultClickInfo[] = isDefaultClickMonitorDisabled ? null : []

        // 页面关闭前进行未上报数据缓存
        const unloadHandler = (source: IDefaultClickInfo[] | IBaseClickElementInfo[] | null) => {
            if (source && source.length) {
                client.baseTransport.postMessageToWorkerThread({
                    type: 'preLoadRequest',
                    payload: {
                        priority: RequestBundlePriorityEnum.USERBEHAVIOR,
                        sendData: {
                            type: 'userBehavior',
                            eventName: 'click',
                            userInfo,
                            deviceInfo: client.deviceInfo,
                            collectedData: {
                                ...getUrlTimestamp(),
                                data: clickElementRecord.slice()
                            },
                        }
                    }
                })
            }
        }
        if (!isDefaultClickMonitorDisabled) {
            // 点击任意地方, 获取坐标
            const anywhereClickMonitor = (ev: MouseEvent) => {
                // 没收集到足够的数据则暂时不上报
                if (defaultClickRecord && defaultClickRecord?.length < DEFAULT_CLICK_COUNT_WHEN_TRANSPORT) {
                    const { clientX, clientY } = ev
                    defaultClickRecord.push({
                        clientY,
                        clientX
                    })
                }

                // 收集量达标则上报
                if (defaultClickRecord && defaultClickRecord?.length === DEFAULT_CLICK_COUNT_WHEN_TRANSPORT) {
                    const originalData: DefaultClickTransportData = {
                        ...getUrlTimestamp(),
                        data: {
                            clickRecord: defaultClickRecord.slice()
                        }
                    }
                    notify('click', originalData)
                    defaultClickRecord = []
                }
            }
            client.eventBus.subscribe('onClick', anywhereClickMonitor)
            window.addEventListener(
                'beforeunload',
                () => unloadHandler(defaultClickRecord),
                { capture: true }
            )
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
                    clientX,
                    clientY,
                    innerText: innerText,
                    targetClassList: Array.from(classList || []) as unknown as string[],
                    nodeName: nodeName.toLowerCase(),
                    ...extraCustomData
                }
                clickElementRecord.push(clickElementInfo)
            }

            if (clickElementRecord.length >= DEFAULT_CLICK_ELEMENT_COUNT_WHEN_TRANSPORT) {
                const originalData: ClickElementTransportData = {
                    ...getUrlTimestamp(),
                    data: {
                        clickElementRecord: clickElementRecord.slice()
                    }
                }
                notify('click', originalData)
                clickElementRecord = []
            }
        }
        client.eventBus.subscribe('onClick', clickElementHander)
        window.addEventListener(
            'beforeunload',
            () => unloadHandler(clickElementRecord),
            { capture: true }
        )
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            type: 'userBehavior',
            eventName: 'click',
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