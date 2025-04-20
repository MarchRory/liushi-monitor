import { TrackIndicator } from '.prisma/client'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { SEARCH_ALL_VALUE } from 'src/common/constant';
import { FindListBaseDto } from 'src/common/dtos/find-list';

export class CreateIndicatorDto {
    @IsNumber()
    eventTypeId: number;

    @IsNotEmpty()
    @IsString()
    indicatorName: string

    @IsNotEmpty()
    @IsString()
    indicatorCn: string

    @IsBoolean()
    isDefault: boolean

    constructor(model: Partial<TrackIndicator>) {
        Object.assign(this, model);
    }
}

export class FindIndicatorListDto extends FindListBaseDto {
    eventTypeId: number | typeof SEARCH_ALL_VALUE
}

export class UpdateIndicatorDto extends CreateIndicatorDto {
    @IsNumber()
    id: number

    @IsBoolean()
    isDeleted: boolean
}

export class FindIndicatorDto extends UpdateIndicatorDto { }