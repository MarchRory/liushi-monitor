import { IBasePlugin } from "monitor-sdk/src";
import { RequestBundlePriorityEnum } from "monitor-sdk/src/types";
import { aop } from "monitor-sdk/src/utils/aop";
import { IHttpMemoryValue } from "./types/httpInfoMap";
import { getCurrentTimeStamp } from "monitor-sdk/src/utils/time";
import { isRequest, isString, isURL } from "monitor-sdk/src/utils/is";
import { getUrlTimestamp } from "monitor-sdk/src/utils/common";

/**
 * TODO: bug -> 改插件和xhr插件一起安装时，会导致transport重复载入请求数据
 */
const FetchPlugin: IBasePlugin<'performance', 'http'> = {
    eventTypeName: 'performance',
    indicatorName: 'http',
    monitor(_, notify) {
        if (!('fetch' in window)) {
            return
        }

        const fetchMemeoryBucket = new Map<string | URL, IHttpMemoryValue>()
        function fetchProxy(nativeFn: typeof fetch) {
            return function (this: typeof fetch, ...args: Parameters<typeof fetch>) {
                const [resource, options] = args
                const requestMemory: IHttpMemoryValue = {
                    requestMemoryInfo: {
                        originRequestType: 'fetch',
                        startTime: getCurrentTimeStamp(),
                        method: 'GET'
                    }
                }

                let interfaceUrl = ''
                if (isString(resource)) {
                    const { method = 'GET' } = options || {}
                    interfaceUrl = resource
                    requestMemory.requestMemoryInfo.method = method
                } else if (isRequest(resource)) {
                    const { url, method } = resource
                    requestMemory.requestMemoryInfo.method = method
                    interfaceUrl = url
                } else if (isURL(resource)) {
                    const { href } = resource
                    const { method = 'GET' } = options || {}
                    interfaceUrl = href
                    requestMemory.requestMemoryInfo.method = method
                }

                fetchMemeoryBucket.set(interfaceUrl, requestMemory)
                return nativeFn.apply(this, args)
                    .then(
                        (res: Response) => {
                            const { url } = res
                            const requestMemoryInfo = fetchMemeoryBucket.get(url)
                            if (!requestMemoryInfo) return

                            const { startTime, method, originRequestType } = requestMemoryInfo.requestMemoryInfo
                            const collectedData = {
                                ...getUrlTimestamp(),
                                data: {
                                    responseType: 'json',
                                    interfaceUrl: url,
                                    responseCode: 200,
                                    spentTime: getCurrentTimeStamp() - startTime,
                                    method,
                                    originRequestType
                                }
                            }
                            fetchMemeoryBucket.delete(url)
                            notify('http', collectedData)
                        },
                        (err: Error) => {

                        }
                    )
            }
        }
        aop(window, 'fetch', (nativeFn) => fetchProxy(nativeFn))
    },
    dataTransformer(_, originalData) {
        return {
            eventTypeName: 'performance',
            indicatorName: 'http',
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

export default FetchPlugin