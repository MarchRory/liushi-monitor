const timeUnits = [
    { name: '小时', duration: 3600 * 60 * 1000 },
    { name: '分钟', duration: 60 * 1000 },
    { name: '秒', duration: 1 * 1000 },
];
/**
 * @description 根据时间戳差值计算时长
 * @param timestampDifference 时间戳差值
 * @returns 时长
 */
export function formatElapsedTime(timestampDifference: number): string {
    let output = '';

    for (const { name, duration } of timeUnits) {
        const count = Math.floor(timestampDifference / duration);
        if (count > 0 || output.length > 0) {
            output += `${count.toString().padStart(name === '秒' ? 1 : 2, '0')}${name}`;
            timestampDifference %= duration;
        }
        if (output.length > 0 && name === '分钟') break;
    }

    return output || '0秒';
}