import { IUserTypeEnum } from "src/common/constant"

export interface ITokenPayload {
    id: number
    user_type: IUserTypeEnum
}