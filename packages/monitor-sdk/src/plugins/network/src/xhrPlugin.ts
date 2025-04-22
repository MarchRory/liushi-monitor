import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { aop } from "monitor-sdk/src/utils/aop";
import { getUrlTimestamp } from "monitor-sdk/src/utils/common";
import { IHttpMemoryValue } from "./types/httpInfoMap";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { isString, isURL } from "monitor-sdk/src/utils/is";


const XHRPlugin: IBasePlugin<'performance', 'http'> = {
    type: 'performance',
    eventName: 'http',
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
                        startTime: getCurrentTimeStamp()
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
                                interfaceUrl: responseURL,
                                responseCode: resObj.code || null,
                                spentTime: getCurrentTimeStamp() - startTime,
                                method,
                                originRequestType
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
    dataTransformer(_, originalData) {
        return {
            type: 'performance',
            eventName: 'http',
            userInfo: "unknown",
            deviceInfo: 'unknown',
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