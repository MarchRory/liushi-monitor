export interface NestArr<T = any> {
    [key: string]: any
    children?: NestArr<T> | null
}

/**
 * @description 抽取一个嵌套的对象数组里指定key的值, 组成新数组返回
 * @param target 一个对象或者一个对象数组s
 * @param key
 */
export function getSpecificValueIntoArr<T = any>(target: NestArr<T>, key: string, cb?: (...args: any[]) => any): T[] {
    const res: T[] = [];
    const origin = Array.isArray(target) ? target : [target];
    origin.forEach((item) => {
        const resItem = cb ? cb(item[key]) : item[key];
        res.push(resItem);
        if (Array.isArray(item.children)) {
            res.push(...getSpecificValueIntoArr(item.children, key));
        }
    });
    return res;
}