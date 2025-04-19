import { Transform } from "class-transformer"
import { Min, IsNumber } from "class-validator"

export class FindListBaseDto {
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1, { message: "页码不得小于1" })
    pageNum: number

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(10, { message: "每页查询数据不能少于10条" })
    pageSize: number
}