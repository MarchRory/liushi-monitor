export function isUndefined(source: any): source is undefined {
    return typeof source === 'undefined'
}

export function isNull(source: any): source is null {
    return source === null
}

export function isObject(source: any): source is Record<string, any> {
    return typeof source !== 'undefined' && Object.prototype.toString.call(source) === "[object Object]"
}

export function isRequest(source: any): source is Request {
    return typeof source !== 'undefined' && Object.prototype.toString.call(source) === "[object Request]"
}

export function isURL(source: any): source is URL {
    return typeof source !== 'undefined' && Object.prototype.toString.call(source) === "[object URL]"
}

export function isString(source: any): source is String {
    return typeof source !== 'undefined' && Object.prototype.toString.call(source) === "[object String]"
}