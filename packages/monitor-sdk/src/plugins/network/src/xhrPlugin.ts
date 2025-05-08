import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { aop } from "monitor-sdk/src/utils/aop";
import { getCustomFunction, getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { IHttpMemoryValue } from "./types/httpInfoMap";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { isString, isURL } from "monitor-sdk/src/utils/is";


const XHRPlugin: IBasePlugin<'performance', 'http'> = {
    eventTypeName: 'performance',
    indicatorName: 'http',
    monitor(_, notify) {
        if (!('XMLHttpRequest' in window)) {
            return
        }

        const httpRequestInfoBucket = new Map<string | URL, IHttpMemoryValue>()
        function xhrOpenProxy(nativeFn: XMLHttpRequest['open']) {
            return function (this: XMLHttpRequest, ...args: Parameters<XMLHttpRequest['open']>) {
                const [method, url] = args
                if (httpRequestInfoBucket.has(url)) return

                const requestMemoryInfo: IHttpMemoryValue = {
                    requestMemoryInfo: {
                        method,
                        originRequestType: 'xhr',
                        startTime: new Date(getCurrentTimeStamp()).getTime()
                    },
                }

                let interfaceURL = ''
                if (isString(url)) {
                    interfaceURL = url
                } else if (isURL(url)) {
                    interfaceURL = url.href
                }
                httpRequestInfoBucket.set(interfaceURL, requestMemoryInfo)
                return nativeFn.apply(this, args)
            }
        }
        aop(XMLHttpRequest.prototype, 'open', xhrOpenProxy)

        function xhrSendProxy(nativeFn: XMLHttpRequest['send']) {
            return function (this: XMLHttpRequest, ...args: Parameters<XMLHttpRequest['send']>) {
                const readyStateChangeHandler = () => {
                    if (this.readyState === 4) {
                        const { responseType, responseURL, response } = this

                        const requestMemoryInfo = httpRequestInfoBucket.get(responseURL)
                        if (!requestMemoryInfo) return
                        const resObj = JSON.parse(response)

                        const { startTime, method, originRequestType } = requestMemoryInfo.requestMemoryInfo
                        const collectedData = {
                            ...getUrlTimestamp(),
                            data: {
                                responseType: responseType || 'json',
                                interfaceUrl: new URL(responseURL).pathname,
                                responseCode: resObj.code || resObj.status || null,
                                value: new Date(getCurrentTimeStamp()).getTime() - startTime,
                                method,
                                // originRequestType
                            }
                        }
                        httpRequestInfoBucket.delete(responseURL)
                        this.removeEventListener('loadend', readyStateChangeHandler)
                        notify('http', collectedData)
                    }
                }
                this.addEventListener('loadend', readyStateChangeHandler)
                return nativeFn.apply(this, args)
            }
        }
        aop(XMLHttpRequest.prototype, 'send', xhrSendProxy)
    },
    dataTransformer(client, originalData) {
        const getUserInfo = getCustomFunction('getUserInfo')
        const userInfo = getUserInfo ? getUserInfo() : 'unknown'
        return {
            eventTypeName: 'performance',
            indicatorName: 'http',
            userInfo,
            deviceInfo: client.deviceInfo,
            collectedData: originalData,
        }
    },
    dataConsumer(transport, transformedData) {
        transport.preLoadRequest({
            priority: RequestBundlePriorityEnum.PERFORMANCE,
            sendData: transformedData
        })
    },
}

export default XHRPlugin