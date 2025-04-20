import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { IHttpError, IResponseCodeEnum, IResponseModel } from '../../types/request'

class HttpRequest {
    private axiosInstance: AxiosInstance
    constructor() {
        this.axiosInstance = this.initAxios()
    }
    private initAxios(): AxiosInstance {
        const instance = axios.create({
            baseURL: import.meta.env.VITE_APP_API_BASE_URL,
            timeout: 5 * 1000,
            withCredentials: true
        })

        instance.interceptors.request.use(
            (config) => {
                return config
            }
        )

        instance.interceptors.response.use(
            (response: AxiosResponse<IResponseModel>): AxiosResponse['data'] => {
                const { code, data, messageText } = response.data
                if (code !== IResponseCodeEnum.SUCCESS) {
                    message.open({
                        type: 'error',
                        content: messageText || "网络异常",
                        key: `request-error-${code}-${Math.random() * Math.random()}`
                    })
                    switch (+code) {
                        case IResponseCodeEnum.NO_PERMISSION:
                            // TODO: 登出
                            break;
                        default:
                            break
                    }
                    return Promise.reject(data)
                }
                return response.data
            },
            (error: AxiosError<IResponseModel & IHttpError>) => {
                const { message: errorMsg, response } = error
                let msg = ''
                if (response && response.data && (response.data.messageText || response.data.message)) {
                    msg = response.data.messageText || response.data.message
                } else if (errorMsg) {
                    msg = errorMsg
                } else {
                    msg = '网络异常'
                }
                message.open({
                    type: "error",
                    content: msg,
                    key: `request-error-${error.code}-${Math.random() * Math.random()}`
                })
            }
        )

        return instance
    }
    private request<T>(config: AxiosRequestConfig) {
        return this.axiosInstance.request(config) as Promise<IResponseModel<T>>
    }

    /**
     * 
     * @param url 接口地址
     * @param params query参数
     * @param otherConfig 可选, axios其他配置
     * @returns 
     */
    get<T = any>(url: string, params?: any, otherConfig?: Omit<AxiosRequestConfig, 'url' | 'params' | 'method'>) {
        return this.request<T>({ url, params, method: 'GET', ...otherConfig })
    }

    /**
     * 
     * @param url 接口地址
     * @param data 请求体
     * @param otherConfig 可选, axios其他配置
     * @returns 
     */
    post<T = any>(url: string, data: any, otherConfig?: Omit<AxiosRequestConfig, 'url' | 'data' | 'method'>) {
        return this.request<T>({ url, data, method: 'POST', ...otherConfig })
    }

    /**
     * 
     * @param url 接口地址
     * @param data 可选, 请求体
     * @param otherConfig 可选, axios其他配置
     * @returns 
     */
    put<T = any>(url: string, data?: any, otherConfig?: Omit<AxiosRequestConfig, 'url' | 'data' | 'method'>) {
        return this.request<T>({ url, data, method: 'PUT', ...otherConfig })
    }
    /**
     * 
     * @param url 接口地址
     * @param deletedIdsObj 需要删除的id的对象, 按照接口中给出的顺序一一对应
     * @param otherConfig 可选, axios其他配置
     * @returns 
     */
    delete<T = any>(url: string, deletedIds?: number[], otherConfig?: Omit<AxiosRequestConfig, 'url' | 'method'>) {
        const ids: string =
            deletedIds
                ? '/' + deletedIds.join('/')
                : ''
        const custom_url = url + ids
        return this.request<T>({ url: custom_url, method: "DELETE", ...otherConfig })
    }
}

const requestInstance = new HttpRequest()

export default requestInstance