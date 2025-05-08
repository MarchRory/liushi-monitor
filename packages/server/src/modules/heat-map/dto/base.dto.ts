import { Expose } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsUrl, IsInt, Min, Max } from 'class-validator';

export class HeatMapBasePicDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    imageUrl: string;

    @Expose()
    width: number;

    @Expose()
    height: number;

    @Expose()
    status: number;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    constructor(partial: Partial<HeatMapBasePicDto>) {
        Object.assign(this, partial);
    }
}

export class CreateHeatMapBasePicDto {
    @IsNotEmpty({ message: '底图名称不能为空' })
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty({ message: '底图URL不能为空' })
    imageUrl: string;

    @IsNotEmpty({ message: '底图宽度不能为空' })
    @IsInt({ message: '底图宽度必须为整数' })
    @Min(1, { message: '底图宽度必须大于0' })
    width: number;

    @IsNotEmpty({ message: '底图高度不能为空' })
    @IsInt({ message: '底图高度必须为整数' })
    @Min(1, { message: '底图高度必须大于0' })
    height: number;

    @IsOptional()
    @IsInt({ message: '状态必须为整数' })
    status?: number;
}

export class UpdateStatusDto {
    @IsNotEmpty({ message: '状态不能为空' })
    @IsInt({ message: '状态必须为整数' })
    @Min(0, { message: '状态值必须为0或1' })
    @Max(1, { message: '状态值必须为0或1' })
    status: number;
}

export class UpdateHeatMapBasePicDto extends PartialType(CreateHeatMapBasePicDto) { }