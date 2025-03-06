import { ISDKInitialOptions } from "./option";

/**
 * 用户传入的自定义方法
 */
export type UserCustomFunctions = Pick<ISDKInitialOptions, 'getUserInfo' | 'dataEncryptionMethod'>
export type CustomUserFunctionEnum = keyof UserCustomFunctions