/**
 * 递归遍历对象，将其中所有的函数转换为字符串
 */
export function transformFunctionsToString<T = any>(value: T): any {
    // 如果是函数，直接转换为字符串
    if (typeof value === 'function') {
        return value.toString();
    }

    // 如果是数组，递归处理每个元素
    if (Array.isArray(value)) {
        return value.map(item => transformFunctionsToString(item));
    }

    // 如果是对象且不为 null，则遍历属性
    if (value !== null && typeof value === 'object') {
        const result = {} as Record<string, any>;
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                result[key] = transformFunctionsToString(value[key]);
            }
        }
        return result;
    }

    // 其它数据直接返回
    return value;
}
