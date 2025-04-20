import { IListModel, ListRequestParamsModel } from "../../types/request";
import requestInstance from "../../utils/request";
import { IComp, ICompListItem, ICompType, IEventListItem, IEventType, IIndicator } from "./types";

/****************** 埋点事件类型管理 ****************/
export function GetEventTypeList(params: ListRequestParamsModel) {
    return requestInstance.get<IListModel<IEventListItem>>('tracking/event', params)
}
export function AddEventType(data: Omit<IEventType, 'id'>) {
    return requestInstance.post('tracking/event', data)
}
export function UpdateEventType(data: IEventType) {
    return requestInstance.put('tracking/event', data)
}
export function DeleteEventType(id: number) {
    return requestInstance.delete('tracking/event', [id])
}
/****************** 埋点事件类型管理 ****************/


/****************** 具体指标管理 ****************/
export function GetIndicatorsList(params: ListRequestParamsModel<Pick<IIndicator, 'eventTypeId'>>) {
    return requestInstance.get<IListModel<IIndicator>>('tracking/indicator', params)
}
export function AddIndicator(data: Omit<IIndicator, 'id'>) {
    return requestInstance.post('tracking/indicator', data)
}
export function UpdateIndicator(data: IIndicator) {
    return requestInstance.put('tracking/indicator', data)
}
export function DeleteIndicator(id: number) {
    return requestInstance.delete('tracking/indicator', [id])
}
/****************** 具体指标管理 ****************/


/****************** 监控组件大类管理 ****************/
export function GetCompTypeList(params: ListRequestParamsModel) {
    return requestInstance.get<IListModel<ICompType & { componentCount: number }>>('tracking/componentType', params)
}
export function AddCompType(data: Omit<ICompType, 'id'>) {
    return requestInstance.post('tracking/componentType', data)
}
export function UpdateCompType(data: ICompType) {
    return requestInstance.put('tracking/componentType', data)
}
export function DeleteCompType(id: number) {
    return requestInstance.delete('tracking/componentType', [id])
}
/****************** 监控组件大类管理 ****************/


/****************** 监控具体组件管理 ****************/
export function GetCompList(params: ListRequestParamsModel<Pick<IComp, 'componentTypeId'>>) {
    return requestInstance.get<IListModel<ICompListItem>>('tracking/component', params)
}
export function AddComp(data: Omit<IComp, 'id'>) {
    return requestInstance.post('tracking/component', data)
}
export function UpdateComp(data: IComp) {
    return requestInstance.put('tracking/component', data)
}
export function DeleteComp(id: number) {
    return requestInstance.delete('tracking/component', [id])
}
/****************** 监控具体组件管理 ****************/