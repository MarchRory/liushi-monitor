import { TrackEventType } from '@prisma/client'

import { Exclude } from "class-transformer";

export class EventItemEntity {
    id: number;
    eventTypeName: string;
    isDefault: boolean;
    indicatorCount: number

    @Exclude()
    isDeleted: boolean;

    constructor(model: Partial<TrackEventType> & { indicatorCount: number }) {
        Object.assign(this, model);
    }
}
