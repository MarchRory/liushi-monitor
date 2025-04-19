import { IUserTypeEnum } from './common/constant'

declare module 'express' {
    interface Request {
        user: {
            id: number,
            user_type: IUserTypeEnum
        }
    }
}