import { create } from 'zustand'
import { ISystemUserInfo, IUserTypeEnum } from '../apis/user/types'

type UserStoreState = Omit<ISystemUserInfo, 'id'> & { isLogin: boolean, menu: any[] }
type UserActions = {
    setUserInfo: (info: Pick<UserStoreState, 'user_name' | "user_type">) => void,
    clearAndLogout: () => void,
    setMenu: (menu: any[]) => void
}

// 暂时没更改信息的需要
const useUserStore = create<UserStoreState & UserActions>((set) => ({
    user_name: "",
    user_type: IUserTypeEnum.INITIAL,
    isLogin: false,
    menu: [],
    setUserInfo: ({ user_name, user_type }) => {
        set(() => {
            return { user_name, user_type, isLogin: true }
        })
    },
    clearAndLogout: () => {
        set(() => ({ user_name: "", user_type: IUserTypeEnum.INITIAL, isLogin: false }))
    },
    setMenu: (menu: any[]) => {
        set(() => ({ menu }))
    }
}))

export default useUserStore