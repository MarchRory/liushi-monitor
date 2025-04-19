import { CreateUserDto } from './create-user.dto';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { Optional } from '@nestjs/common';

export class UpdateUserDto extends CreateUserDto {
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    id: number

    @Optional()
    isDeleted: boolean
}
