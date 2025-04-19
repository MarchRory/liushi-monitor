import { IListModel, ListRequestParamsModel } from "../../types/request";
import { FormValues } from "../../types/utils";
import requestInstance from "../../utils/request";
import { ILoginForm, ISystemUserInfo, ISystemUserListItem, IUserTypeEnum } from "./types";

/****************** 登录 ****************/
export function Login(parmas: ILoginForm) {
    return requestInstance.post<{ token: string }>('/auth/login', parmas)
}
export function Logout() {
    return requestInstance.post('/auth/logout', null)
}
export function GetUserInfo() {
    return requestInstance.get<Omit<ISystemUserInfo, 'id'>>('/user/info')
}
/****************** 登录 ****************/



/****************** 系统用户管理 ****************/
export function GetSystemUserList(searchParams: ListRequestParamsModel<{ userType: IUserTypeEnum }>) {
    return requestInstance.get<IListModel<ISystemUserListItem>>('/user', searchParams)
}
export function GetSystemUserInfo(id: number) {
    return requestInstance.get<FormValues<ISystemUserListItem>>(`/user/${id}`)
}
export function AddSystemUser(form: Omit<ISystemUserListItem, 'id'>) {
    return requestInstance.post('/user', form)
}
export function UpdateSystemUser(form: ISystemUserListItem) {
    return requestInstance.put('/user', form)
}
export function DeleteSystemUser(id: number) {
    return requestInstance.delete('/user', [id])
}
/****************** 系统用户管理 ****************/