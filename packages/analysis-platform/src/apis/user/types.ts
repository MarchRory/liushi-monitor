export interface ILoginForm {
    account: string
    password: string
}
export const enum IUserTypeEnum {
    INITIAL = -1,
    ADMIN,
    ENGINEER,
    OPERATOR,
}
export const UserTypesMap = {
    [IUserTypeEnum.INITIAL]: "",
    [IUserTypeEnum.ADMIN]: '管理员',
    [IUserTypeEnum.ENGINEER]: '开发者',
    [IUserTypeEnum.OPERATOR]: '运营员'
}

export interface ISystemUserInfo {
    id: string
    user_name: string
    user_type: IUserTypeEnum
}

export type ISystemUserListItem = ILoginForm & ISystemUserInfo