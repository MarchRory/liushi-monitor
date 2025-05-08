import * as  dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as  timezone from 'dayjs/plugin/timezone';
import { BaseChartDataSearchDto } from 'src/modules/analysis/dto/base.dto';

dayjs.extend(utc);
dayjs.extend(timezone);


class DateUtils {
    /**
     * 获取今天的开始时间（00:00:00）
     */
    getStartOfToday(): Date {
        return dayjs().startOf('day').toDate();
    }

    /**
     * 获取今天的结束时间（23:59:59）
     */
    getEndOfToday(): Date {
        return dayjs().endOf('day').toDate();
    }

    /**
     * 获取最近的半小时或整小时时间点
     * @returns 最近的时间点
     */
    getLatestTimePoint(): Date {
        const now = dayjs();
        const currentMinute = now.minute();

        // 如果当前分钟小于30，则取当前小时的整点
        // 如果当前分钟大于等于30，则取当前小时的半点
        if (currentMinute < 30) {
            return now.minute(0).second(0).millisecond(0).toDate();
        } else {
            return now.minute(30).second(0).millisecond(0).toDate();
        }
    }

    /**
     * 生成时间段范围内的半小时刻度时间点
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @returns 时间点数组
     */
    generateTimePoints(startTime: Date, endTime: Date): Date[] {
        const timePoints: Date[] = [];
        let current = dayjs(startTime).minute(Math.floor(dayjs(startTime).minute() / 30) * 30).second(0).millisecond(0);
        const end = dayjs(endTime);

        while (current.isBefore(end) || current.isSame(end)) {
            timePoints.push(current.toDate());
            // 增加30分钟
            current = current.add(30, 'minute');
        }

        return timePoints;
    }

    /**
     * 将时间格式化为固定格式
     * @param date 日期对象
     * @returns 格式化后的字符串
     */
    formatDateTime(utcDate: Date): string {
        // 添加 8 小时（北京时间比 UTC 快 8 小时）, prisma做orm存储timestamp有问题, 只能手动处理了
        utcDate.setHours(utcDate.getHours() + 8);
        return dayjs(utcDate).format('YYYY-MM-DD HH:mm:ss')
    }

    /**
     * 获取指定时间点所在的30分钟时间区间的开始和结束
     * @param timePoint 时间点
     * @returns 开始和结束时间
     */
    getTimePointRange(timePoint: Date): Pick<BaseChartDataSearchDto, 'startTime' | "endTime"> {
        const time = dayjs(timePoint);
        const minute = time.minute();
        let start: dayjs.Dayjs;

        // 根据分钟确定所在的时间区间
        if (minute < 30) {
            start = time.minute(0).second(0).millisecond(0);
        } else {
            start = time.minute(30).second(0).millisecond(0);
        }

        const end = start.add(30, 'minute').subtract(1, 'millisecond');

        return {
            startTime: start.toDate(),
            endTime: end.toDate(),
        };
    }
    getTodayTimeRange(): { startTime: string; endTime: string } {
        const now = dayjs();
        const startOfDay = now.startOf('day');

        return {
            startTime: startOfDay.format('YYYY-MM-DD HH:mm:ss'),
            endTime: now.format('YYYY-MM-DD HH:mm:ss'),
        };
    }
}

const dataUtils = new DateUtils()
export default dataUtils