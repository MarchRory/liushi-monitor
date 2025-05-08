import * as  dayjs from "dayjs";

/**
 * 生成数据缓存key
 */
export function generateCacheKey(prefix: string, indicatorId: number, url: string, startTime: string | Date, endTime: string | Date): string {
    const formattedStart = dayjs(startTime).format('YYYYMMDD_HHmm');
    const formattedEnd = dayjs(endTime).format('YYYYMMDD_HHmm');
    const urlHash = Buffer.from(url).toString('base64').substring(0, 10);

    return `${prefix}${indicatorId}_${urlHash}_${formattedStart}_${formattedEnd}`;
}