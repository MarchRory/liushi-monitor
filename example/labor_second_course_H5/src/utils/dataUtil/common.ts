/**
 * 深拷贝
 * @param target 需要深拷贝的数据
 * @param hash
 * @returns 拷贝后的数据
 */
export function deepClone<T = any>(target: T, hash = new WeakMap()): T {
    // null 和 undefined
    if (target === null || typeof target !== 'object') return target
    // Date
    // @ts-ignore
    if (target instanceof Date) return new Date(target)
    // 正则
    // @ts-ignore
    if (target instanceof RegExp) return new RegExp(target)
    // Set、Map、Function
    // @ts-ignore
    if (target instanceof Set) return new Set(target)
    // @ts-ignore
    if (target instanceof Map) return new Map(target)
    // @ts-ignore
    if (target instanceof Function) return new target.constructor(target)
    // 对象进行深拷贝
    // 利用 weakMap 存储已经深拷贝过的情况，避免无限递归
    if (hash.get(target)) return hash.get(target)
    // 调用当前对象原型上的构造器
    // @ts-ignore
    let cloneObj = new target.constructor()
    // hash记录一下
    hash.set(target, cloneObj)
    // 递归拷贝对象上的每一个属性
    for (let key in target) {
        if (target.hasOwnProperty(key)) {
            cloneObj[key] = deepClone(target[key], hash)
        }
    }
    return cloneObj
}