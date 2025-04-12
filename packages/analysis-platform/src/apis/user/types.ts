export interface ILoginForm {
    account: string
    password: string
}
export const enum IUserTypeEnum {
    ADMIN,
    ENGINEER,
    OPERATOR,
}
export const UserTypesMap = {
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