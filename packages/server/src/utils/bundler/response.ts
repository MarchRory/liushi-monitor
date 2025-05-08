import { ResponseCode, responseMsgMap } from "src/config/response/codeMap";
import { IResponseModel } from "src/types/response";

export function listBundler(total: number, list: any[]) {
    return {
        total,
        list
    }
}

export function responseBundler(code: ResponseCode, data?: Object | string | null, messageText?: string): IResponseModel {
    // const transformedData = data ? transformCamelToKebab(data) : null
    return {
        code,
        messageText: messageText || responseMsgMap[code],
        data: data || null
    }
}