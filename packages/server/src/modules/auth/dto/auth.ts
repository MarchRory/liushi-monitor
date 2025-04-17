import { IsNotEmpty, Length } from 'class-validator'

export class LoginAuthDTO {
    @IsNotEmpty({ message: '账号为必填项' })
    account: string

    @IsNotEmpty({ message: '密码为必填项' })
    @Length(4, 15, { message: "密码需为4到20个字符" })
    password: string
}