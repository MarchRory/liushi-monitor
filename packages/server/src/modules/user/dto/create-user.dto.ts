import { User } from "@prisma/client";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { IUserTypeEnum } from "src/common/constant";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: '用户名为必填项' })
    userName: string;

    @IsString()
    @IsNotEmpty({ message: '账号为必填项' })
    @Length(4, 10, { message: "账号需要为4到10个字符" })
    account: string;

    @IsString()
    @IsNotEmpty({ message: '密码为必填项' })
    @Length(4, 15, { message: "密码需要为4到15个字符" })
    password: string;

    @IsNotEmpty({ message: "需要分配用户角色" })
    userType: IUserTypeEnum;

    constructor(model: Partial<User>) {
        Object.assign(this, model);
    }
}
