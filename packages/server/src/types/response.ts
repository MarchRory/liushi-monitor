import { ResponseCode, responseMsgMap } from "src/config/response/codeMap";

export interface IResponseModel<T extends ResponseCode = ResponseCode> {
    code: ResponseCode,
    messageText: typeof responseMsgMap[T],
    data: Object | null
}