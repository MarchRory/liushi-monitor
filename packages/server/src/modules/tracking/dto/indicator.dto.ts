import { TrackIndicator } from '@prisma/client'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateIndicatorDto {
    @IsNumber()
    eventTypeId: number;

    @IsNotEmpty()
    @IsString()
    indicatorName: string

    @IsBoolean()
    isDefault: boolean

    constructor(model: Partial<TrackIndicator>) {
        Object.assign(this, model);
    }
}

export class UpdateIndicatorDto extends CreateIndicatorDto {
    @IsNumber()
    id: number
}

export class FindIndicatorDto extends UpdateIndicatorDto { }