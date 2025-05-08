import { Optional } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class BaseDataSearchDto {
    @IsNotEmpty()
    @IsDateString()
    startTime: string | Date

    @IsNotEmpty()
    @IsDateString()
    endTime: string | Date

    @IsBoolean()
    @Optional()
    @Transform(({ value }) => value === 'true' ? true : false)
    refresh: boolean

    @IsString()
    @IsNotEmpty()
    url: string
}

export class BaseChartDataSearchDto extends BaseDataSearchDto {
    @Transform(({ value }) => +parseInt(value, 10))
    @Optional()
    indicatorId: number
}

export class BaseHttpOverviewSearch extends BaseDataSearchDto {
    @IsString()
    @IsNotEmpty()
    interfaceUrl: string
}

export class BaseErrorOverviewSearch {
    @IsNotEmpty()
    @IsDateString()
    startTime: string | Date

    @IsNotEmpty()
    @IsDateString()
    endTime: string | Date

    @IsBoolean()
    @Optional()
    @Transform(({ value }) => value === 'true' ? true : false)
    refresh: boolean
}

export class BaseSpecificErrorTable extends BaseErrorOverviewSearch {
    @IsString()
    @IsNotEmpty()
    errorTypeId: string
}

export class BaseBehaviorOverviewSearch extends BaseDataSearchDto { }