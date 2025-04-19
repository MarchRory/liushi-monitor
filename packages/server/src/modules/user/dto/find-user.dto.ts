import { IsOptional } from "class-validator";
import { IUserTypeEnum } from "src/common/constant";
import { FindListBaseDto } from "src/common/dtos/find-list";

export class findUserListDto extends FindListBaseDto {
    @IsOptional()
    userType: IUserTypeEnum | null
}