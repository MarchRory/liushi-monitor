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
