import { ResponseCode, responseMsgMap } from "src/config/response/codeMap";
import { IResponseModel } from "src/types/response";

export function responseBundler(code: ResponseCode, data?: Object | null): IResponseModel {
    return {
        code,
        messageText: responseMsgMap[code],
        data: data || null
    }
}