import { TrackComponent, TrackComponentType } from '.prisma/client'
import { Exclude } from 'class-transformer';

export class ComponentEntity {
    id: number;
    componentTypeId: number;
    componentTypeCn: string
    isDefault: boolean;
    componentName: string;
    componentCn: string;

    @Exclude()
    isDeleted: boolean;


    constructor(model: Partial<TrackComponent & Pick<TrackComponentType, 'componentTypeCn'>>) {
        Object.assign(this, model)
    }
}