import { TrackIndicator, TrackEventType } from '.prisma/client'

import { Exclude } from "class-transformer";

export class IndicatorItemEntity {
    id: number;
    indicatorName: string;
    IndicatorCn: string
    isDefault: boolean;
    eventTypeId: number
    eventTypeName: string
    eventTypeCn: string

    @Exclude()
    isDeleted: boolean;

    constructor(model: Partial<TrackIndicator & Pick<TrackEventType, 'eventTypeCn' | "eventTypeName">>) {
        Object.assign(this, model);
    }
}
