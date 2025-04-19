import { IListModel, ListRequestParamsModel } from "../../types/request";
import requestInstance from "../../utils/request";
import { IEventListItem, IEventType, IIndicator } from "./types";

/****************** 埋点事件类型管理 ****************/
export function GetEventTypeList(params: ListRequestParamsModel) {
    return requestInstance.get<IListModel<IEventListItem>>('tracking/events', params)
}
export function AddEventType(data: Omit<IEventType, 'id'>) {
    return requestInstance.post('tracking/events', data)
}
export function UpdateEventType(data: IEventType) {
    return requestInstance.put('tracking/events', data)
}
export function DeleteEventType(id: number) {
    return requestInstance.delete('tracking/events', [id])
}
/****************** 埋点事件类型管理 ****************/


/****************** 具体指标管理 ****************/
export function GetIndicatorsList(params: ListRequestParamsModel<Pick<IIndicator, 'eventTypeId'>>) {
    return requestInstance.get<IListModel<IIndicator>>('tracking/indicators', params)
}
export function AddIndicator(data: Omit<IIndicator, 'id'>) {
    return requestInstance.post('tracking/indicators', data)
}
export function UpdateIndicator(data: IIndicator) {
    return requestInstance.put('tracking/indicators', data)
}
export function DeleteIndicator(id: number) {
    return requestInstance.delete('tracking/indicators', [id])
}
/****************** 具体指标管理 ****************/
