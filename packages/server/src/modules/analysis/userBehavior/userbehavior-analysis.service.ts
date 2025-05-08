import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { BaseBehaviorOverviewSearch } from '../dto/base.dto';
import * as  dayjs from 'dayjs';
import { listBundler, responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';

@Injectable()
export class UserhehaviorAnalysisService {
    private readonly logger: Logger = new Logger(UserhehaviorAnalysisService.name)
    constructor(
        private readonly redisService: RedisService,
        private readonly prismaService: PrismaService
    ) { }
    async calculateMeaningfulUrls() {
        const urls = await this.prismaService.heatMapBasePic.findMany({
            select: {
                name: true,
            },
            distinct: ['name'],
        })
        const options = urls.map(({ name }) => name)
        return responseBundler(ResponseCode.SUCCESS, listBundler(options.length, options))
    }
    async calculateBehaviorOverview(dto: BaseBehaviorOverviewSearch) {
        const cacheKey = `behavior_overview:${dto.url}:${dto.startTime}:${dto.endTime}`;

        if (!dto.refresh) {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        const [viewsData, interactionData, exposureData, trendData] = await Promise.all([
            this.getViewsAnalysis(dto),
            this.getInteractionAnalysis(dto),
            this.getExposureAnalysis(dto),
            this.getTrendAnalysis(dto)
        ]);

        const result = {
            overview: {
                views: viewsData,
                interaction: interactionData,
                exposure: exposureData
            },
            trends: trendData
        };

        await this.redisService.set(cacheKey, JSON.stringify(result), 3600);
        return responseBundler(ResponseCode.SUCCESS, result)
    }

    private async getTrendAnalysis(dto: BaseBehaviorOverviewSearch) {
        const startTime = dayjs(dto.startTime);
        const endTime = dayjs(dto.endTime);
        const diffDays = endTime.diff(startTime, 'day');
        const intervals: { start: Date, end: Date }[] = [];

        if (diffDays <= 1) {

            let current = startTime.startOf('hour');
            while (current.isBefore(endTime)) {

                intervals.push({
                    start: current.toDate(),
                    end: current.add(30, 'minute').toDate()
                });
                current = current.add(30, 'minute');
            }
        } else if (diffDays <= 31) {

            let current = startTime.startOf('day');
            while (current.isBefore(endTime)) {
                intervals.push({
                    start: current.toDate(),
                    end: current.add(1, 'day').toDate()
                });
                current = current.add(1, 'day');
            }
        } else {

            let current = startTime.startOf('month');
            while (current.isBefore(endTime)) {
                intervals.push({
                    start: current.toDate(),
                    end: current.add(1, 'month').toDate()
                });
                current = current.add(1, 'month');
            }
        }

        const trends = await Promise.all(intervals.map(async interval => {
            const [views, interactions, exposureData] = await Promise.all([
                this.prismaService.views.count({
                    where: {
                        url: dto.url,
                        timestamp: {
                            gte: interval.start,
                            lt: interval.end
                        },
                        isDeleted: false
                    }
                }),
                this.prismaService.interaction.count({
                    where: {
                        url: dto.url,
                        timestamp: {
                            gte: interval.start,
                            lt: interval.end
                        },
                        isDeleted: false
                    }
                }),
                this.prismaService.exposure.aggregate({
                    where: {
                        url: dto.url,
                        timestamp: {
                            gte: interval.start,
                            lt: interval.end
                        },
                        isDeleted: false
                    },
                    _avg: {
                        value: true
                    }
                })
            ]);

            const formatStr = diffDays <= 1 ? 'YYYY-MM-DD HH:mm' :
                diffDays <= 31 ? 'YYYY-MM-DD' :
                    'YYYY-MM';

            return {
                timestamp: dayjs(interval.start).format(formatStr),
                views,
                interactions,
                exposureAvg: +(Math.floor(exposureData._avg.value || 0) / 1000)
            };
        }));

        return trends
    }
    private async getViewsAnalysis(dto: BaseBehaviorOverviewSearch) {
        // 获取当前时间段的数据
        const currentPeriodViews = await this.prismaService.views.count({
            where: {
                url: dto.url,
                timestamp: {
                    gte: new Date(dto.startTime),
                    lte: new Date(dto.endTime)
                },
                isDeleted: false
            }
        });

        // 获取独立访客数
        const uniqueVisitors = await this.prismaService.views.groupBy({
            by: ['producerId'],
            where: {
                url: dto.url,
                timestamp: {
                    gte: new Date(dto.startTime),
                    lte: new Date(dto.endTime)
                },
                isDeleted: false,
                producerId: {
                    not: null
                }
            }
        });

        // 计算上一个时间段的数据用于环比
        const timeSpan = dayjs(dto.endTime).diff(dayjs(dto.startTime), 'millisecond');
        const previousStartTime = dayjs(dto.startTime).subtract(timeSpan, 'millisecond');
        const previousEndTime = dayjs(dto.startTime);

        const previousPeriodViews = await this.prismaService.views.count({
            where: {
                url: dto.url,
                timestamp: {
                    gte: previousStartTime.toDate(),
                    lte: previousEndTime.toDate()
                },
                isDeleted: false
            }
        });

        const previousUniqueVisitors = await this.prismaService.views.groupBy({
            by: ['producerId'],
            where: {
                url: dto.url,
                timestamp: {
                    gte: previousStartTime.toDate(),
                    lte: previousEndTime.toDate()
                },
                isDeleted: false,
                producerId: {
                    not: null
                }
            }
        });

        return {
            pv: currentPeriodViews,
            uv: uniqueVisitors.length,
            previousPv: previousPeriodViews,
            previousUv: previousUniqueVisitors.length
        };
    }

    private async getInteractionAnalysis(dto: BaseBehaviorOverviewSearch) {
        // 获取当前时间段的交互数据
        const currentPeriodInteractions = await this.prismaService.interaction.count({
            where: {
                url: dto.url,
                timestamp: {
                    gte: new Date(dto.startTime),
                    lte: new Date(dto.endTime)
                },
                isDeleted: false
            }
        });

        // 计算上一个时间段的数据
        const timeSpan = dayjs(dto.endTime).diff(dayjs(dto.startTime), 'millisecond');
        const previousStartTime = dayjs(dto.startTime).subtract(timeSpan, 'millisecond');
        const previousEndTime = dayjs(dto.startTime);

        const previousPeriodInteractions = await this.prismaService.interaction.count({
            where: {
                url: dto.url,
                timestamp: {
                    gte: previousStartTime.toDate(),
                    lte: previousEndTime.toDate()
                },
                isDeleted: false
            }
        });

        // 按事件类型分组统计
        const interactionsByType = await this.prismaService.interaction.groupBy({
            by: ['eventTypeId'],
            where: {
                url: dto.url,
                timestamp: {
                    gte: new Date(dto.startTime),
                    lte: new Date(dto.endTime)
                },
                isDeleted: false
            },
            _count: true
        });

        return {
            total: currentPeriodInteractions,
            previousTotal: previousPeriodInteractions,
            byType: interactionsByType
        };
    }

    private async getExposureAnalysis(dto: BaseBehaviorOverviewSearch) {
        const currentPeriodExposures = await this.prismaService.exposure.aggregate({
            where: {
                url: dto.url,
                timestamp: {
                    // 直接使用输入的时间，因为数据库中存储的就是毫秒级时间戳
                    gte: new Date(dto.startTime),
                    lte: new Date(dto.endTime)
                },
                isDeleted: false
            },
            _avg: {
                value: true
            }
        });

        const timeSpan = Math.floor(dayjs(dto.endTime).diff(dayjs(dto.startTime), 'second'));
        const previousStartTime = dayjs(dto.startTime).subtract(timeSpan, 'second');
        const previousEndTime = dayjs(dto.startTime);

        const previousPeriodExposures = await this.prismaService.exposure.aggregate({
            where: {
                url: dto.url,
                timestamp: {
                    gte: previousStartTime.toDate(),
                    lte: previousEndTime.toDate()
                },
                isDeleted: false
            },
            _avg: {
                value: true
            }
        });

        return {
            avgValue: +(Math.floor(currentPeriodExposures._avg.value || 0) / 1000),
            previousAvgValue: +(Math.floor(previousPeriodExposures._avg.value || 0) / 1000),
        };
    }
}
