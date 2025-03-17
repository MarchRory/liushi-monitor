export function isUndefined(source: any) {
    return typeof source === 'undefined'
}

export function isObject(source: any): source is Record<string, any> {
    return typeof source !== 'undefined' && Object.prototype.toString.call(source) === "[object Object]"
}