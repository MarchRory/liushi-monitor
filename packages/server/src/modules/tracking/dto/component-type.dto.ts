import { TrackComponentType } from '.prisma/client'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateComponentTypeDto {
    @IsNotEmpty()
    @IsString()
    componentTypeName: string;

    @IsNotEmpty()
    @IsString()
    componentTypeCn: string;

    @IsBoolean()
    isDefault: boolean;

    constructor(model: Partial<TrackComponentType>) {
        Object.assign(this, model);
    }
}

export class UpdateComponentTypeDto extends CreateComponentTypeDto {
    @IsNumber()
    id: number

    @IsBoolean()
    isDeleted: boolean
}