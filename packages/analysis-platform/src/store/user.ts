import { create } from 'zustand'
import { ISystemUserInfo, IUserTypeEnum } from '../apis/user/types'
import { RouteObject } from 'react-router-dom'

type UserStoreState = Omit<ISystemUserInfo, 'id'> & { isLogin: boolean, menu: RouteObject[] }
type UserActions = {
    setUserInfo: (info: Pick<UserStoreState, 'userName' | 'userType'>) => void,
    clearAndLogout: () => void,
    setMenu: (menu: any[]) => void
}

// 暂时没更改信息的需要
const useUserStore = create<UserStoreState & UserActions>((set) => ({
    userName: "",
    userType: IUserTypeEnum.INITIAL,
    isLogin: false,
    menu: [],
    setUserInfo: ({ userName, userType }) => {
        set(() => {
            return { userName, userType, isLogin: true }
        })
    },
    clearAndLogout: () => {
        set(() => ({ userName: "", userType: IUserTypeEnum.INITIAL, isLogin: false }))
    },
    setMenu: (menu: any[]) => {
        set(() => ({ menu }))
    }
}))

export default useUserStore