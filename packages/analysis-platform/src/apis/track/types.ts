import { IBaseMainDataInfo } from "../../types/common";

export interface IEventType extends IBaseMainDataInfo {
    eventTypeName: string
}

export interface IEventListItem extends IEventType {
    indicatorCount: number
}

export interface IIndicator extends IBaseMainDataInfo {
    eventTypeId: number
    indicatorName: string
}
