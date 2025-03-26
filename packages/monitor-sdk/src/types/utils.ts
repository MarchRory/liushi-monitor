/**
 * 兼容嵌套属性, 将类型中的全部可选属性变为必选属性
 */
export type DeepRequired<T extends object> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type ExtractKey<T extends object> = keyof T

/**
 * 或许是高阶函数
 */
export type MaybeHigherOrderFunction<T extends 'higher' | 'common' = 'common', P extends "promise" | "common" = 'common', R = P extends 'promise' ? Promise<any> : any> =
    T extends 'common' ? ((...args: any[]) => R) : ((...args: any[]) => (...args: any[]) => R)