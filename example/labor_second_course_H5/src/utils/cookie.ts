type CookieData = Record<string, any> | string | number;
interface DefaultCookie {
    key: string;
    data: CookieData;
    expiresDays: number;
}

// 检验字符串是否可以转化为数字
const isStrNumberReg = /^[+-]?\d*(\.\d*)?(e[+-]?\d+)?$/;

/**
 * 检查cookie是否过期
 * @param expires Cookie过期时间 (UTC)
 * @returns boolean
 */
const checkCookie = (expires: string): boolean => {
    const now = new Date();
    const expiresDate = new Date(expires);
    return now >= expiresDate;
};

/**
 * 设置Cookie, 如果传入key有cookie则覆盖, 否则新建
 * @param key cookie key
 * @param data 存储的数据, 类型为object、string或number
 * @param expiresDays 过期时间, 默认30天
 */
export const setCookie = (key: string, data: CookieData, expiresDays: number = 30) => {
    let cookieData = '';
    // 因为中文的原因, 存储的时候需要编码
    if (typeof data === 'object') {
        let objJson = JSON.stringify(data);
        cookieData = encodeURIComponent(objJson);
    }
    else if (['string', 'number'].includes(typeof data)) {
        cookieData = encodeURIComponent(data);
    }
    else {
        throw new Error('请存储对象、字符串或是数值');
    }
    // 当前key有旧Cookie, 则覆盖
    const date = new Date();
    const expires = date.setTime(date.getTime() + expiresDays * 1000 * 60 * 60 * 24);
    document.cookie = `${key}=${cookieData};expires=${new Date(expires).toUTCString()}`;
};

export const removeCookie = (key: string) => {
    setCookie(key, '', -1);
};

/**
 * 获取Cookie, 若传入默认值则当没有找到cookie时, 将默认值写入cookie中并返回默认值中的数据
 * @param key 需要获取的Cookie的key
 * @param defaultCookie.key 默认的Cookie key
 * @param defaultCookie.data 默认的Cookie数据
 * @param defaultCookie.expiresDays 默认的Cookie过期时间
 * @returns 找到cookie或者传入默认cookie则返回cookie数据, 否则返回null
 */
export const getCookie = (key: string, defaultCookie?: DefaultCookie): any => {
    const cookieArr = document.cookie.split('; ');
    const needCookie = cookieArr.find(item => item.split('=')[0] === key);
    if (needCookie) {
        const isExpired = checkCookie(needCookie.split(';expires=')[1]);
        // 过期删掉原有cookie, 传入了默认值就更新为默认值
        if (isExpired) {
            removeCookie(key);
            if (defaultCookie) {
                setCookie(defaultCookie.key, defaultCookie.data, defaultCookie.expiresDays);
                return defaultCookie.data;
            }
        }
        else {
            const cookieData = needCookie.split('=')[1].split(';expires=')[0];
            // 因为中文的原因, 从cookie中拿出时候需要解码
            const decodeCookieData = decodeURIComponent(cookieData);
            // 检验解码后的json对应的js数据，若是对象则反序列化, 字符串和数字则返回对应类型的值
            if (decodeCookieData.length && decodeCookieData.startsWith('{') && decodeCookieData.endsWith('}')) {
                return JSON.parse(decodeCookieData);
            }
            else {
                return isStrNumberReg.test(decodeCookieData) ? +decodeCookieData : decodeCookieData;
            }
        }
    }
    else {
        // 传入了默认值，若当前没有找到cookie，则设置默认值
        if (defaultCookie) {
            setCookie(defaultCookie.key, defaultCookie.data, defaultCookie.expiresDays);
            return defaultCookie.data;
        }
        else {
            return null;
        }
    }
};