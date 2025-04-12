import { IListModel, ListRequestParamsModel } from "../../types/request";
import requestInstance from "../../utils/request";
import { ILoginForm, ISystemUserInfo, ISystemUserListItem, IUserTypeEnum } from "./types";

/****************** 登录 ****************/
export function Login(parmas: ILoginForm) {
    return requestInstance.get<ISystemUserInfo>('/login', parmas)
}
export function Logout() {
    return requestInstance.get('/logout')
}
export function GetUserInfo(token: string) {
    return requestInstance.get<ISystemUserInfo>('/userInfo', { token })
}
/****************** 登录 ****************/



/****************** 系统用户管理 ****************/
export function GetSystemUserList(searchParams: ListRequestParamsModel<{ userType: IUserTypeEnum | null }>) {
    return requestInstance.get<IListModel<ISystemUserListItem>>('/user', searchParams)
}
export function AddSystemUser(form: Omit<ISystemUserListItem, 'id'>) {
    return requestInstance.post('/user', form)
}
export function UpdateSystemUserInfo(form: ISystemUserListItem) {
    return requestInstance.put('/user', form)
}
export function DeleteSystemUser(id: string) {
    return requestInstance.delete('/user', [id])
}
/****************** 系统用户管理 ****************/