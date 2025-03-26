/**
 * 获取当前时间戳
 * @returns 时间戳
 */
export function getCurrentTimeStamp() {
    return new Date().getTime()
}

/**
 * 格式化时间差
 * @param diff 时间戳差值
 * @returns 格式化后的时间差, 最小单位为s
 */
export function formatTimeDifference(diff: number) {
    if (diff >= 3600000) {
        // 大于等于1小时
        const hours = Math.floor(diff / 3600000);
        const remainderAfterHours = diff % 3600000;
        const minutes = Math.floor(remainderAfterHours / 60000);
        const remainderAfterMinutes = remainderAfterHours % 60000;
        const seconds = Math.floor(remainderAfterMinutes / 1000);
        let result = `${hours}h`;
        if (minutes > 0) {
            result += `${minutes}mins`;
        }
        if (seconds > 0) {
            result += `${seconds}s`;
        }
        return result;
    } else if (diff >= 60000) {
        // 大于等于1分钟但小于1小时
        const minutes = Math.floor(diff / 60000);
        const remainderAfterMinutes = diff % 60000;
        const seconds = Math.floor(remainderAfterMinutes / 1000);
        let result = `${minutes}mins`;
        if (seconds > 0) {
            result += `${seconds}s`;
        }
        return result;
    } else if (diff >= 1000) {
        // 大于等于1秒但小于1分钟
        const seconds = Math.floor(diff / 1000);
        return `${seconds}s`;
    } else {
        // 小于1秒时，显示秒（保留3位小数），最小单位为ms
        return `${(diff / 1000).toFixed(3)}s`;
    }
}

/**
 * 检验两个时间戳是否是同一天
 * @param day1 时间戳1
 * @param day2 时间戳2
 * @returns {boolean}
 */
export function isSameDay(day1: number, day2: number): boolean {
    const date1 = new Date(day1);
    const date2 = new Date(day2);

    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}
