import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { TrackingService } from 'src/modules/tracking/tracking.service';
import { BaseChartDataSearchDto } from '../dto/base.dto';
import { generateCacheKey } from 'src/utils/common/cache';
import { PerformanceIndicatorEnum, IPerformanceIndicatorChartData } from '../types';
import dateUtils from '../../../utils/common/time'
import {
    FCP_CHART_DATA_CACHE_PREFIX,
    FP_CHART_DATA_CACHE_PREFIX,
    LCP_CHART_DATA_CACHE_PREFIX,
    SPA_PAGE_LOAD_TIME_CACHE_PREFIX,
    TTFB_CHART_DATA_CACHE_PREFIX
} from './constant';
import { responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';
import * as dayjs from 'dayjs';

@Injectable()
export class PerformanceAnalysisService {
    private readonly logger: Logger = new Logger(PerformanceAnalysisService.name)
    /**
     * 缓存有效期半小时
     */
    private readonly CACHE_TTL = 1000 * 60 * 30
    constructor(
        private readonly redisService: RedisService,
        private readonly prismaService: PrismaService,
        private readonly trackingService: TrackingService
    ) { }


    /**
     * 计算首屏指标的图表数据
     * @param dto 
     * @param indicatorEnum 
     * @param needResponse 是否需要返回响应, 默认true, 执行定时任务时为false
     * @returns 
     */
    async calculateFirstScreenIndicatorsChartData(dto: BaseChartDataSearchDto, indicatorEnum: PerformanceIndicatorEnum, needResponse = true) {
        const { indicatorId, url, startTime, endTime, refresh } = dto;

        // 生成缓存键
        let cacheKey = ''

        // 如果不需要刷新且缓存存在，则直接返回缓存数据
        if (!refresh) {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                this.logger.debug(`使用缓存数据 ${cacheKey}`);
                return responseBundler(ResponseCode.SUCCESS, JSON.parse(cachedData))
            }
        }

        // 获取时间范围内的所有半小时时间点
        const timePoints = dateUtils.generateTimePoints(startTime as Date, endTime as Date);

        let chartData: IPerformanceIndicatorChartData;

        // 根据指标ID计算相应的图表数据
        switch (indicatorEnum) {
            case PerformanceIndicatorEnum.LCP:
                cacheKey = generateCacheKey(LCP_CHART_DATA_CACHE_PREFIX, indicatorId, url, startTime, endTime);
                chartData = await this.calculateLCPChartData(url, timePoints, indicatorId);
                break;
            case PerformanceIndicatorEnum.FP:
                cacheKey = generateCacheKey(FP_CHART_DATA_CACHE_PREFIX, indicatorId, url, startTime, endTime);
                chartData = await this.calculateFPChartData(url, timePoints, indicatorId);
                break;
            case PerformanceIndicatorEnum.FCP:
                cacheKey = generateCacheKey(FCP_CHART_DATA_CACHE_PREFIX, indicatorId, url, startTime, endTime);
                chartData = await this.calculateFCPChartData(url, timePoints, indicatorId);
                break;
            case PerformanceIndicatorEnum.TTFB:
                cacheKey = generateCacheKey(TTFB_CHART_DATA_CACHE_PREFIX, indicatorId, url, startTime, endTime);
                chartData = await this.calculateTTFBChartData(url, timePoints, indicatorId);
                break;
            case PerformanceIndicatorEnum.SPA_LOAD_TIME:
                cacheKey = generateCacheKey(SPA_PAGE_LOAD_TIME_CACHE_PREFIX, indicatorId, url, startTime, endTime)
                chartData = await this.calculateSPALoadTimeChartData(url, timePoints, 17)
                break;
            default:
                throw new Error(`Unsupported indicator ID: ${indicatorId}`);
        }

        // 缓存计算结果
        await this.redisService.set(cacheKey, JSON.stringify(chartData), this.CACHE_TTL);

        if (needResponse) {
            return responseBundler(ResponseCode.SUCCESS, chartData)
        }
    }

    /**
      * 计算LCP (Largest Contentful Paint)图表数据
      * 适合使用柱状图 + 折线图组合展示，折线展示平均值，柱状图展示数据分布
      */
    private async calculateLCPChartData(url: string, timePoints: Date[], indicatorId: number): Promise<IPerformanceIndicatorChartData> {
        const indicatorMap = await this.trackingService.getIndicatorMapCache()
        const chartData: IPerformanceIndicatorChartData = {
            indicatorId,
            indicatorCn: indicatorMap[indicatorId].indicatorCn,
            url,
            timePoints: [],
            values: [], // 平均值
            median: [], // 中位数
            p75: [],    // 75百分位数
            p90: [],    // 90百分位数
            count: []   // 样本数量
        };

        for (const timePoint of timePoints) {
            const { startTime, endTime } = dateUtils.getTimePointRange(timePoint);

            const where = {
                indicatorId: +indicatorId,
                timestamp: {
                    gte: startTime,
                    lte: endTime
                },
                isDeleted: false
            }
            if (url != '*') {
                where['url'] = url
            }

            // 执行数据库查询，获取该时间范围内的LCP数据
            const lcpData = await this.prismaService.performance.findMany({
                where,
                select: {
                    value: true
                }
            });

            if (lcpData.length > 0) {
                // 计算统计值
                const values = lcpData.map(item => item.value);
                const count = values.length;
                const sum = values.reduce((acc, val) => acc + val, 0);
                const avg = Math.round(sum / count);

                // 排序以计算中位数和百分位数
                values.sort((a, b) => a - b);

                const medianValue = this.calculatePercentile(values, 50);
                const p75Value = this.calculatePercentile(values, 75);
                const p90Value = this.calculatePercentile(values, 90);

                // 添加到图表数据
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(avg);
                chartData.median.push(medianValue);
                chartData.p75.push(p75Value);
                chartData.p90.push(p90Value);
                chartData.count.push(count);
            } else {
                // 没有数据时，添加null值
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(null);
                chartData.median.push(null);
                chartData.p75.push(null);
                chartData.p90.push(null);
                chartData.count.push(0);
            }
        }

        return chartData;
    }

    /**
     * 计算FP (First Paint)图表数据
     * 适合使用折线图展示，关注趋势变化
     */
    private async calculateFPChartData(url: string, timePoints: Date[], indicatorId: number): Promise<IPerformanceIndicatorChartData> {
        const indicatorMap = await this.trackingService.getIndicatorMapCache()
        const chartData: IPerformanceIndicatorChartData = {
            indicatorId,
            indicatorCn: indicatorMap[indicatorId].indicatorCn,
            url,
            timePoints: [],
            p75: [],
            p90: [],
            values: [], // 平均值
            median: [], // 中位数
            count: []   // 样本数量
        };

        for (const timePoint of timePoints) {
            const { startTime, endTime } = dateUtils.getTimePointRange(timePoint);

            const where = {
                indicatorId: +indicatorId,
                timestamp: {
                    gte: startTime,
                    lte: endTime
                },
                isDeleted: false
            }
            if (url != '*') {
                where['url'] = url
            }

            // 执行数据库查询，获取该时间范围内的FP数据
            const fpData = await this.prismaService.performance.findMany({
                where,
                select: {
                    value: true
                }
            });

            if (fpData.length > 0) {
                // 计算统计值
                const values = fpData.map(item => item.value);
                const count = values.length;
                const sum = values.reduce((acc, val) => acc + val, 0);
                const avg = Math.round(sum / count);

                // 排序以计算中位数
                values.sort((a, b) => a - b);
                const medianValue = this.calculatePercentile(values, 50);

                // 添加到图表数据
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(avg);
                chartData.median.push(medianValue);
                chartData.count.push(count);
            } else {
                // 没有数据时，添加null值
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(null);
                chartData.median.push(null);
                chartData.count.push(0);
            }
        }

        return chartData;
    }

    /**
     * 计算FCP (First Contentful Paint)图表数据
     * 适合使用折线图 + 区域图展示，关注趋势及波动范围
     */
    private async calculateFCPChartData(url: string, timePoints: Date[], indicatorId: number): Promise<IPerformanceIndicatorChartData> {
        const indicatorMap = await this.trackingService.getIndicatorMapCache()
        const chartData: IPerformanceIndicatorChartData = {
            indicatorId,
            indicatorCn: indicatorMap[indicatorId].indicatorCn,
            url,
            timePoints: [],
            p75: [],
            p90: [],
            values: [], // 平均值
            median: [], // 中位数
            count: []   // 样本数量
        };

        for (const timePoint of timePoints) {
            const { startTime, endTime } = dateUtils.getTimePointRange(timePoint);
            const where = {
                indicatorId: +indicatorId,
                timestamp: {
                    gte: startTime,
                    lte: endTime
                },
                isDeleted: false
            }
            if (url != '*') {
                where['url'] = url
            }
            // 执行数据库查询，获取该时间范围内的FCP数据
            const fcpData = await this.prismaService.performance.findMany({
                where,
                select: {
                    value: true
                }
            });

            if (fcpData.length > 0) {
                // 计算统计值
                const values = fcpData.map(item => item.value);
                const count = values.length;
                const sum = values.reduce((acc, val) => acc + val, 0);
                const avg = Math.round(sum / count);

                // 排序以计算百分位数
                values.sort((a, b) => a - b);
                const p75Value = this.calculatePercentile(values, 75);

                // 添加到图表数据
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(avg);
                chartData.p75.push(p75Value);
                chartData.count.push(count);
            } else {
                // 没有数据时，添加null值
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(null);
                chartData.p75.push(null);
                chartData.count.push(0);
            }
        }

        return chartData;
    }

    /**
     * 计算TTFB (Time to First Byte)图表数据
     * 适合使用散点图 + 箱线图展示，关注异常值及分布情况
     */
    private async calculateTTFBChartData(url: string, timePoints: Date[], indicatorId: number): Promise<IPerformanceIndicatorChartData> {
        const indicatorMap = await this.trackingService.getIndicatorMapCache()
        const chartData: IPerformanceIndicatorChartData = {
            indicatorId,
            indicatorCn: indicatorMap[indicatorId].indicatorCn,
            url,
            timePoints: [],
            p75: [],
            p90: [],
            values: [], // 平均值
            median: [], // 中位数
            count: []   // 样本数量
        };

        for (const timePoint of timePoints) {
            const { startTime, endTime } = dateUtils.getTimePointRange(timePoint);
            const where = {
                indicatorId: +indicatorId,
                timestamp: {
                    gte: startTime,
                    lte: endTime
                },
                isDeleted: false
            }
            if (url != '*') {
                where['url'] = url
            }
            // 执行数据库查询，获取该时间范围内的TTFB数据
            const ttfbData = await this.prismaService.performance.findMany({
                where,
                select: {
                    value: true
                }
            });

            if (ttfbData.length > 0) {
                // 计算统计值
                const values = ttfbData.map(item => item.value);
                const count = values.length;
                const sum = values.reduce((acc, val) => acc + val, 0);
                const avg = Math.round(sum / count);

                // 排序以计算中位数和百分位数
                values.sort((a, b) => a - b);
                const medianValue = this.calculatePercentile(values, 50);
                const p90Value = this.calculatePercentile(values, 90);

                // 添加到图表数据
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(avg);
                chartData.median.push(medianValue);
                chartData.p90.push(p90Value);
                chartData.count.push(count);
            } else {
                // 没有数据时，添加null值
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(null);
                chartData.median.push(null);
                chartData.p90.push(null);
                chartData.count.push(0);
            }
        }

        return chartData;
    }

    /**
     * 计算SPA Page Load Time图表数据
     * 适合使用柱状图 + 折线图组合展示，折线展示平均值，柱状图展示数据分布
     */
    async calculateSPALoadTimeChartData(url: string, timePoints: Date[], indicatorId: number): Promise<IPerformanceIndicatorChartData> {
        const indicatorMap = await this.trackingService.getIndicatorMapCache()
        const chartData: IPerformanceIndicatorChartData = {
            indicatorId,
            indicatorCn: indicatorMap[indicatorId].indicatorCn,
            url,
            timePoints: [],
            p75: [],
            p90: [],
            values: [], // 平均值
            median: [], // 中位数
            count: []   // 样本数量
        };

        for (const timePoint of timePoints) {
            const { startTime, endTime } = dateUtils.getTimePointRange(timePoint);
            const where = {
                indicatorId: +indicatorId,
                timestamp: {
                    gte: startTime,
                    lte: endTime
                },
                isDeleted: false
            }
            if (url != '*') {
                where['url'] = url
            }

            const spaLoadData = await this.prismaService.performance.findMany({
                where,
                select: {
                    value: true
                }
            });

            if (spaLoadData.length > 0) {
                // 计算统计值
                const values = spaLoadData.map(item => item.value);
                const count = values.length;
                const sum = values.reduce((acc, val) => acc + val, 0);
                const avg = Math.round(sum / count);

                // 排序以计算百分位数
                values.sort((a, b) => a - b);
                const p75Value = this.calculatePercentile(values, 75);

                // 添加到图表数据
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(avg);
                chartData.p75.push(p75Value);
                chartData.count.push(count);
            } else {
                // 没有数据时，添加null值
                chartData.timePoints.push(dayjs(timePoint).format('YYYY-MM-DD HH:mm:ss'));
                chartData.values.push(null);
                chartData.p75.push(null);
                chartData.count.push(0);
            }
        }

        return chartData;
    }
    /**s
     * 计算百分位数
     * @param sortedValues 已排序的值数组
     * @param percentile 百分位(0-100)
     */
    private calculatePercentile(sortedValues: number[], percentile: number): number | null {
        if (sortedValues.length === 0) return null;

        const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
        return sortedValues[Math.max(0, Math.min(sortedValues.length - 1, index))];
    }
}
