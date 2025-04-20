import { TrackComponent } from '.prisma/client'
import { Optional } from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { FindListBaseDto } from 'src/common/dtos/find-list';

export class CreateComponentDto {
    @IsNumber()
    componentTypeId: number;

    @IsBoolean()
    isDefault: boolean;

    @IsNotEmpty()
    @IsString()
    componentName: string;

    @IsNotEmpty()
    @IsString()
    componentCn: string;

    constructor(model: Partial<TrackComponent>) {
        Object.assign(this, model);
    }
}

export class UpdateComponentDto extends CreateComponentDto {
    @IsNumber()
    id: number

    @IsBoolean()
    isDeleted: boolean
}

export class FindComponentListDto extends FindListBaseDto {
    @Optional()
    componentTypeId: number;
}