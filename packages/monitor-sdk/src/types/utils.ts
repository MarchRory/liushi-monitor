/**
 * 兼容嵌套属性, 将类型中的全部可选属性变为必选属性
 */
export type DeepRequired<T extends object> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type ExtractKey<T extends object> = keyof T