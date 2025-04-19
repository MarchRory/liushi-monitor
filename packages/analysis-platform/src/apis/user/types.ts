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
export interface IUserTypeConfig {
    text: string
    tagColor: string
}
type UserTypeMap = Record<IUserTypeEnum, IUserTypeConfig>
export const UserTypesMap: UserTypeMap = {
    [IUserTypeEnum.INITIAL]: {
        text: "全部",
        tagColor: "gray"
    },
    [IUserTypeEnum.ADMIN]: {
        text: '管理员',
        tagColor: "red"
    },
    [IUserTypeEnum.ENGINEER]: {
        text: '开发者',
        tagColor: "purple"
    },
    [IUserTypeEnum.OPERATOR]: {
        text: '运营员',
        tagColor: "green"
    }
}

export interface ISystemUserInfo {
    id: number
    userName: string
    userType: IUserTypeEnum
}

export type ISystemUserListItem = ILoginForm & ISystemUserInfo