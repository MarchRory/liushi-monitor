import { isNull, isUndefined } from "./is";

/**
 * 面向切面编程, 代替Proxy重写代理各种原生事件
 * @param source 代理的源对象
 * @param prop 需要重写的原生属性
 * @param proxyFn 重写函数
 */
export function aop<T extends object>(source: T, prop: keyof T, proxyFn: (...args: any[]) => any) {
    if (isUndefined(source) || isNull(source)) return
    // 待覆盖的原生属性可能在原型链上
    if (prop in source) {
        const nativeValue = source[prop]
        const proxyValue = proxyFn(nativeValue)
        if (!isUndefined(proxyValue)) {
            source[prop] = proxyValue
        }
    }
}