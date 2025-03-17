/**
 * @description query对象转查询字符串
 * @param params 
 * @returns 
 */
export function generateQueryString(params: Record<string, any>): string {
    return Object.keys(params)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&')
}