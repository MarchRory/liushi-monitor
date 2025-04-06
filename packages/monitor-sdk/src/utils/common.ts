import { deepCloneRegExp } from "../configs/reg"
import { CustomUserFunctionEnum, UserCustomFunctions } from "../types/function"
import { isObject } from "./is"
import { getCurrentTimeStamp } from "./time"
import { getCurrentUrl } from "./url"

/**
 * 深拷贝
 * @param source 数据源
 * @param hash 
 * @returns 数据源的深拷贝
 */
export function deepClone<T = any>(source: T, hash = new WeakMap()): T {
    if (source === null || !isObject(source)) return source

    let constructor = source.constructor
    if (deepCloneRegExp.test(constructor.name)) return constructor(source)
    if (hash.has(source)) return hash.get(source)

    let cloneObj = constructor()
    hash.set(source, cloneObj)

    for (let key in source) {
        if (Object.hasOwn(source, key)) {
            cloneObj[key] = deepClone(source[key], hash)
        }
    }

    return cloneObj
}

/**
 * 收集用户传入的一些自定义方法, 在全局使用, 避免循环引用出现
 */
export const customFunctionBucket = new Map<CustomUserFunctionEnum, UserCustomFunctions[CustomUserFunctionEnum]>()
/**
 * 类型完备的map.get方法
 * @param key map的key
 * @returns 准确类型推导的value
 */
export function getCustomFunction<K extends CustomUserFunctionEnum = CustomUserFunctionEnum>(key: K): UserCustomFunctions[K] | undefined {
    return customFunctionBucket.get(key) as UserCustomFunctions[K] | undefined;
}

/**
 * 防抖
 * @param fn 
 * @param delay 默认300ms
 * @param immediate 
 * @returns 
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300,
    otherConfig?: { immediate?: boolean, thisArg?: any })
    : (...args: Parameters<T>) => void {
    const {
        immediate = false,
        thisArg = undefined
    } = (otherConfig || {})
    let timer: NodeJS.Timeout | null = null
    // @ts-ignore
    const _this = this || thisArg

    return (...args) => {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
        if (!immediate) {
            timer = setTimeout(() => {
                // @ts-ignore
                fn.call(_this, ...args)
            }, delay)
        } else {
            let flag = !timer
            // @ts-ignore
            flag && fn.call(_this, ...args)
            timer = null
        }
    }
}

/**
 * 节流
 * @param fn 
 * @param lockTime 默认800ms内只触发第一次
 * @returns 
 */
export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    lockTime: number = 800
): (...args: Parameters<T>) => void {
    let timer = null;
    let isThrottle = false;
    return (...args: any[]) => {
        if (!isThrottle) {
            // @ts-ignore
            fn.apply(this, args);
            isThrottle = true;
            timer = setTimeout(() => {
                isThrottle = false;
                timer = null;
            }, lockTime);
        }
    };
}

/**
 * 寻找字符串数组中, 是另一长字符串子串的元素们
 * @param string 
 * @param arr 元素不能带空格
 */
export function findSubstrings(string: string, arr: string[] = []) {
    const source = new Set(string.trim().split(/\s+/));
    return arr.filter(el => source.has(el));
}

export function getUrlTimestamp() {
    return {
        url: getCurrentUrl(),
        timestamp: getCurrentTimeStamp()
    }
}