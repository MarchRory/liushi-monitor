import { Optional } from '@nestjs/common';
import { TrackEventType } from '.prisma/client'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateEventDto {
    @IsNotEmpty()
    @IsString()
    eventTypeName: string

    @IsNotEmpty()
    @IsString()
    eventTypeCn: string

    @IsBoolean()
    isDefault: boolean

    constructor(model: Partial<TrackEventType>) {
        Object.assign(this, model);
    }
}

export class FindEventDto {
    @IsNumber()
    id: number

    @IsNotEmpty()
    @IsString()
    eventTypeName: string

    @IsNotEmpty()
    @IsString()
    eventTypeCn

    @IsBoolean()
    isDefault: boolean

    @IsNumber()
    indicatorCount: number

    constructor(model: Partial<TrackEventType>) {
        Object.assign(this, model);
    }
}

export class UpdateEventDto extends CreateEventDto {
    @IsNumber()
    id: number

    @Optional()
    isDeleted: boolean
}