type Primitive = string | number | boolean | null | undefined;
type MaybeArray<T> = T | T[];
type DeepCamelToKebab<T extends object> = {
    [K in keyof T as K extends string ? `${Lowercase<FirstChar<K>>}${'_' extends K ? K : CamelToKebab<K>}` : K]:
    T[K] extends object ? DeepCamelToKebab<T[K]> : T[K];
};

type CamelToKebab<S extends string> =
    S extends `${infer P}${infer R}`
    ? P extends Uncapitalize<P>
    ? `${P}${CamelToKebab<R>}`
    : `-${Uncapitalize<P>}${CamelToKebab<R>}`
    : S;

type FirstChar<S extends string> = S extends `${infer F}${string}` ? F : never;

function isPrimitive(value: unknown): value is Primitive {
    return value === null || typeof value !== 'object' && typeof value !== 'function';
}
const convert = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(convert);
    }
    if (value && typeof value === 'object' && !isPrimitive(value)) {
        const newObj = {} as Record<string, unknown>;
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                const newKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
                newObj[newKey] = convert(value[key]);
            }
        }
        return newObj;
    }
    return value;
};

/**
 * 小驼峰命名转短横线命名
 * @param data 
 * @returns 
 */
export function transformCamelToKebab<T extends object>(data: MaybeArray<T>): MaybeArray<DeepCamelToKebab<T>> {
    return Array.isArray(data) ? data.map(convert) as MaybeArray<DeepCamelToKebab<T>> : convert(data) as MaybeArray<DeepCamelToKebab<T>>;
}