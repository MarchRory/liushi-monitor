import { IBaseMainDataInfo } from "../../types/common";

export interface IEventType extends IBaseMainDataInfo {
    eventTypeName: string
    eventTypeCn: string
}

export interface IEventListItem extends IEventType {
    indicatorCount: number
}

export interface IIndicator extends IBaseMainDataInfo {
    eventTypeId: number | null
    indicatorName: string
    indicatorCn: string
    eventTypeCn?: string
}

export interface ICompType extends IBaseMainDataInfo {
    componentTypeName: string;
    componentTypeCn: string;
}
export interface ICompTypeListItem extends ICompType {
    componentCount: number
}

export interface IComp extends IBaseMainDataInfo {
    componentTypeId: number;
    componentName: string;
    componentCn: string;
}
export interface ICompListItem extends IComp, Pick<ICompType, 'componentTypeCn'> { }