import { FormInstance } from "antd";

export type FormValues<T extends Object> = Parameters<FormInstance<T>['setFieldsValue']>[0]

/**
 * 将类型中的指定属性变为必需
 */
export type PartiallyRequired<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

export type BooleanToNumber<T extends boolean> = T extends true ? 1 : 0