import { TrackComponentType } from '.prisma/client'
import { Exclude } from 'class-transformer';

export class ComponentTypeEntity {
    id: number;
    componentTypeName: string;
    componentTypeCn: string;
    isDefault: boolean;
    componentCount: number

    @Exclude()
    isDeleted: boolean;

    constructor(model: Partial<TrackComponentType & { componentCount: number }>) {
        Object.assign(this, model)
    }
}