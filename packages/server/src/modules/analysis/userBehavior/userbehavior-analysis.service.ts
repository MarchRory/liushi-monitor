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

        await this.redisService.set(cacheKey, JSON.stringify(result, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        }), 3600);
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

    /**
     * 获取设备偏好分析数据
     */
    async getDevicePreferenceAnalysis(dto: BaseBehaviorOverviewSearch) {
        const cacheKey = `device_preference:${dto.url}:${dto.startTime}:${dto.endTime}`;

        if (!dto.refresh) {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        // 获取设备类型分布
        const deviceTypeDistribution = await this.prismaService.producer.groupBy({
            by: ['deviceType'],
            where: {
                views: {
                    some: {
                        url: dto.url,
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false
                    }
                }
            },
            _count: true
        });

        // 获取浏览器分布
        const browserDistribution = await this.prismaService.producer.groupBy({
            by: ['deviceBowserName'],
            where: {
                views: {
                    some: {
                        url: dto.url,
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false
                    }
                }
            },
            _count: true
        });

        // 获取操作系统分布
        const osDistribution = await this.prismaService.producer.groupBy({
            by: ['deviceOs'],
            where: {
                views: {
                    some: {
                        url: dto.url,
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false
                    }
                }
            },
            _count: true
        });

        // 获取不同设备类型的平均曝光时间
        const deviceExposureTime = await Promise.all(
            deviceTypeDistribution.map(async (device) => {
                const avgExposure = await this.prismaService.exposure.aggregate({
                    where: {
                        url: dto.url,
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false,
                        producer: {
                            deviceType: device.deviceType
                        }
                    },
                    _avg: {
                        value: true
                    }
                });

                return {
                    deviceType: device.deviceType,
                    count: device._count,
                    avgExposureTime: +(Math.floor(avgExposure._avg.value || 0) / 1000)
                };
            })
        );

        const result = {
            deviceTypeDistribution,
            browserDistribution,
            osDistribution,
            deviceExposureTime
        };

        await this.redisService.set(cacheKey, JSON.stringify(result, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        }), 3600);
        return responseBundler(ResponseCode.SUCCESS, result);
    }

    /**
     * 获取漏斗分析数据
     */
    async getFunnelAnalysis(dto: BaseBehaviorOverviewSearch) {
        const cacheKey = `funnel_analysis:${dto.url}:${dto.startTime}:${dto.endTime}`;
        if (!dto.refresh) {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        // 定义Tabbar页面集合
        const tabbarPages = new Set(['#/home', '#/plan', '#/user']);

        // 获取以dto.url为起点的路径栈数据
        const pathStacks = await this.prismaService.pathStack.findMany({
            where: {
                stack: {
                    startsWith: dto.url
                },
                isDeleted: false
            },
            select: {
                id: true,
                stack: true,
                exposures: {
                    where: {
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false
                    },
                    select: {
                        id: true,
                        value: true
                    }
                }
            }
        });

        // 过滤掉没有曝光数据的路径栈
        const validPathStacks = pathStacks.filter(stack => stack.exposures.length > 0);

        // ===== 漏斗数据处理 =====
        // 解析路径栈，寻找最长路径
        let longestPath: string[] = [];

        validPathStacks.forEach(pathStack => {
            const paths = pathStack.stack.split('->');

            // 清洗路径 - 去除连续重复的页面
            const cleanedPaths: string[] = [];
            for (let i = 0; i < paths.length; i++) {
                if (i === 0 || paths[i] !== paths[i - 1]) {
                    cleanedPaths.push(paths[i]);
                }
            }

            // 进一步处理路径，只保留向前的路径（去除回退）
            const forwardPaths: string[] = [];
            const visitedPages = new Set();

            for (const path of cleanedPaths) {
                if (!visitedPages.has(path)) {
                    visitedPages.add(path);
                    forwardPaths.push(path);
                }
            }

            // 如果路径只有一个页面（只停留在当前页面），则不计入漏斗
            if (forwardPaths.length <= 1) {
                return;
            }

            // 更新最长路径
            if (forwardPaths.length > longestPath.length) {
                longestPath = forwardPaths;
            }
        });

        // ===== 路径转换数据处理 =====
        // 构建路径转换图
        const pathMap = new Map();

        validPathStacks.forEach(pathStack => {
            const paths = pathStack.stack.split('->');
            const exposureCount = pathStack.exposures.length;
            const cleanedPaths: string[] = [];

            // 清洗路径
            for (let i = 0; i < paths.length; i++) {
                if (i === 0 || paths[i] !== paths[i - 1]) {
                    cleanedPaths.push(paths[i]);
                }
            }

            // 去除回退
            const forwardPaths: string[] = [];
            const visitedPages = new Set();

            for (const path of cleanedPaths) {
                if (!visitedPages.has(path)) {
                    visitedPages.add(path);
                    forwardPaths.push(path);
                }
            }

            // 记录路径转换
            for (let i = 0; i < forwardPaths.length - 1; i++) {
                const from = forwardPaths[i];
                const to = forwardPaths[i + 1];
                const key = `${from}->${to}`;

                const count = pathMap.get(key) || 0;
                pathMap.set(key, count + exposureCount);
            }
        });

        // 转换为数组格式
        let pathTransitions = Array.from(pathMap.entries())
            .map(([path, count]) => {
                const [from, to] = path.split('->');
                return {
                    from,
                    to,
                    count: Number(count)
                };
            })
            .sort((a, b) => b.count - a.count);

        // ===== 路径转换数据验算 =====
        // 计算每个页面的总访问量
        const pageVisits = new Map();
        validPathStacks.forEach(stack => {
            const paths = stack.stack.split('->');
            const exposureCount = stack.exposures.length;

            paths.forEach(path => {
                const count = pageVisits.get(path) || 0;
                pageVisits.set(path, count + exposureCount);
            });
        });

        // 构建页面层级关系
        const pageLevels = new Map();
        pageLevels.set(dto.url, 0);

        // 使用BFS确定页面层级
        const queue = [dto.url];
        const visited = new Set([dto.url]);

        while (queue.length > 0) {
            const current = queue.shift();
            const currentLevel = pageLevels.get(current);

            // 找到所有从current出发的路径
            pathTransitions
                .filter(item => item.from === current)
                .forEach(item => {
                    if (!visited.has(item.to)) {
                        visited.add(item.to);
                        queue.push(item.to);
                        pageLevels.set(item.to, currentLevel + 1);
                    }
                });
        }

        // 从最深层开始向上更新路径计数
        const maxLevel = Math.max(...Array.from(pageLevels.values()));
        const updatedCounts = new Map();

        for (let level = maxLevel; level >= 0; level--) {
            // 获取当前层级的所有页面
            const currentLevelPages = Array.from(pageLevels.entries())
                .filter(([_, pageLevel]) => pageLevel === level)
                .map(([page]) => page);
            currentLevelPages.forEach(page => {
                // 获取从该页面出发的所有路径
                const outgoingPaths = pathTransitions.filter(item => item.from === page);

                if (outgoingPaths.length === 0) {
                    // 如果是终点页面，使用页面的实际访问量
                    updatedCounts.set(page, pageVisits.get(page) || 0);
                    return;
                }

                // 计算该页面的总流出量（使用原始计数的比例关系）
                const totalOriginalOutflow = outgoingPaths.reduce((sum, path) => sum + path.count, 0);

                // 获取该页面的实际访问量
                const pageVisitCount = pageVisits.get(page) || 0;

                // 更新从该页面出发的路径计数，保持原有比例
                outgoingPaths.forEach(path => {
                    const ratio = path.count / totalOriginalOutflow;
                    path.count = Math.floor(pageVisitCount * ratio);
                });

                // 更新该页面的计数为实际访问量
                updatedCounts.set(page, pageVisitCount);
            });
        }


        // 更新pathTransitions的计数
        pathTransitions.forEach(path => {
            const fromCount = updatedCounts.get(path.from) || 0;
            if (path.count > fromCount) {
                path.count = fromCount;
            }
        });

        // 重新排序
        pathTransitions.sort((a, b) => b.count - a.count);

        // 构建漏斗步骤数据
        let funnelSteps: { step: string, count: number }[] = [];
        if (longestPath.length > 1) {
            funnelSteps = longestPath.map(path => ({
                step: path,
                count: updatedCounts.get(path) || 0
            }));
        }

        // 分析相同路径的停留情况（tabbar页面）
        const tabbarStays = pathTransitions
            .filter(item => item.from === item.to && tabbarPages.has(item.from))
            .map(item => ({
                path: item.from,
                stayCount: item.count,
                avgStayTime: 0
            }));

        // 计算每个tabbar页面的平均停留时间
        await Promise.all(
            tabbarStays.map(async (item) => {
                const relevantPathStackIds = validPathStacks
                    .filter(ps => ps.stack.includes(`${item.path}->${item.path}`))
                    .map(ps => ps.id);

                if (relevantPathStackIds.length === 0) {
                    item.avgStayTime = 0;
                    return;
                }

                const avgStayTime = await this.prismaService.exposure.aggregate({
                    where: {
                        pathStackId: {
                            in: relevantPathStackIds
                        },
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false
                    },
                    _avg: {
                        value: true
                    }
                });

                item.avgStayTime = +(Math.floor(avgStayTime._avg.value || 0) / 1000);
            })
        );

        const result = {
            funnelSteps,
            // pathTransitions: pathTransitions.slice(0, 10),
            // tabbarStays: tabbarStays.slice(0, 5)
        };

        await this.redisService.set(cacheKey, JSON.stringify(result, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        }), 3600);

        return responseBundler(ResponseCode.SUCCESS, result);
    }

    /**
     * 获取曝光深度分析数据
     */
    async getExposureDepthAnalysis(dto: BaseBehaviorOverviewSearch) {
        const cacheKey = `exposure_depth:${dto.url}:${dto.startTime}:${dto.endTime}`;

        if (!dto.refresh) {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        // 获取曝光时间分布
        const exposureDistribution = (await this.prismaService.$queryRaw`
            SELECT
            CASE
                WHEN value/1000 < 5 THEN '0-5秒'
                WHEN value/1000 >= 5 AND value/1000 < 15 THEN '5-15秒'
                WHEN value/1000 >= 15 AND value/1000 < 30 THEN '15-30秒'
                WHEN value/1000 >= 30 AND value/1000 < 60 THEN '30-60秒'
                WHEN value/1000 >= 60 AND value/1000 < 180 THEN '1-3分钟'
                WHEN value/1000 >= 180 AND value/1000 < 300 THEN '3-5分钟'
                ELSE '5分钟以上'
            END as time_range,
            CAST(COUNT(*) AS SIGNED) as count
            FROM exposure
            WHERE url = ${dto.url} 
            AND timestamp >= ${new Date(dto.startTime)} 
            AND timestamp <= ${new Date(dto.endTime)} 
            AND isDeleted = false 
            GROUP BY time_range 
            ORDER BY 
            CASE time_range 
                WHEN '0-5秒' THEN 1 
                WHEN '5-15秒' THEN 2 
                WHEN '15-30秒' THEN 3 
                WHEN '30-60秒' THEN 4 
                WHEN '1-3分钟' THEN 5 
                WHEN '3-5分钟' THEN 6 
                ELSE 7 
            END 
        `) as { time_range: string, count: bigint }[]

        // 获取不同路径的平均曝光时间
        const pathExposureTime = await this.prismaService.pathStack.findMany({
            where: {
                exposures: {
                    some: {
                        url: dto.url,
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false
                    }
                },
                isDeleted: false
            },
            select: {
                stack: true,
                exposures: {
                    where: {
                        url: dto.url,
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false
                    },
                    select: {
                        value: true
                    }
                }
            }
        });

        // 计算每个路径的平均曝光时间
        const pathAvgExposure = pathExposureTime.map(path => {
            const totalValue = path.exposures.reduce((sum, exp) => sum + exp.value, 0);
            const avgValue = path.exposures.length > 0 ? totalValue / path.exposures.length : 0;

            return {
                path: path.stack,
                avgExposureTime: +(Math.floor(avgValue) / 1000),
                count: path.exposures.length
            };
        }).sort((a, b) => b.count - a.count);

        // 分析用户性别与曝光时间的关系
        const genderExposureTime = await this.prismaService.producer.groupBy({
            by: ['sex'],
            where: {
                exposures: {
                    some: {
                        url: dto.url,
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false
                    }
                }
            },
            _count: true
        });

        // 计算每个性别的平均曝光时间
        const genderAvgExposure = await Promise.all(
            genderExposureTime.map(async (gender) => {
                const avgExposure = await this.prismaService.exposure.aggregate({
                    where: {
                        url: dto.url,
                        timestamp: {
                            gte: new Date(dto.startTime),
                            lte: new Date(dto.endTime)
                        },
                        isDeleted: false,
                        producer: {
                            sex: gender.sex
                        }
                    },
                    _avg: {
                        value: true
                    }
                });

                return {
                    gender: gender.sex === 1 ? '男' : gender.sex === 2 ? '女' : '未知',
                    count: gender._count,
                    avgExposureTime: +(Math.floor(avgExposure._avg.value || 0) / 1000)
                };
            })
        );

        const result = {
            exposureDistribution: exposureDistribution.map(item => ({
                time_range: item.time_range,
                count: Number(item.count)
            })),
            pathAvgExposure: pathAvgExposure.slice(0, 10), // 取前10个最常见的路径
            genderAvgExposure
        };

        await this.redisService.set(cacheKey, JSON.stringify(result), 3600);
        return responseBundler(ResponseCode.SUCCESS, result);
    }

    /**
     * 获取用户行为时间分析数据
     */
    async getTimeAnalysis(dto: BaseBehaviorOverviewSearch) {
        const cacheKey = `time_analysis:${dto.url}:${dto.startTime}:${dto.endTime}`;

        if (!dto.refresh) {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        // 按小时分析用户活跃度
        const hourlyActivity = await this.prismaService.$queryRaw`
    SELECT 
      EXTRACT(HOUR FROM timestamp) as hour,
      COUNT(*) as count
    FROM views
    WHERE url = ${dto.url}
      AND timestamp >= ${new Date(dto.startTime)}
      AND timestamp <= ${new Date(dto.endTime)}
      AND isDeleted = false
    GROUP BY hour
    ORDER BY hour
  `;

        // 按星期几分析用户活跃度
        const weekdayActivity = await this.prismaService.$queryRaw`
    SELECT 
      EXTRACT(DOW FROM timestamp) as weekday,
      COUNT(*) as count
    FROM views
    WHERE url = ${dto.url}
      AND timestamp >= ${new Date(dto.startTime)}
      AND timestamp <= ${new Date(dto.endTime)}
      AND isDeleted = false
    GROUP BY weekday
    ORDER BY weekday
  `;

        // 分析用户回访情况
        const userReturnRate = await this.prismaService.$queryRaw`
    WITH user_visits AS (
      SELECT 
        producer_id,
        COUNT(DISTINCT DATE(timestamp)) as visit_days
      FROM views
      WHERE url = ${dto.url}
        AND timestamp >= ${new Date(dto.startTime)}
        AND timestamp <= ${new Date(dto.endTime)}
        AND isDeleted = false
        AND producer_id IS NOT NULL
      GROUP BY producer_id
    )
    SELECT 
      visit_days,
      COUNT(*) as user_count
    FROM user_visits
    GROUP BY visit_days
    ORDER BY visit_days
  `;

        // 处理星期几的数据，转换为中文
        const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const formattedWeekdayActivity = (weekdayActivity as any[]).map(item => ({
            weekday: weekdayNames[item.weekday],
            count: Number(item.count)
        }));

        // 处理小时数据
        const formattedHourlyActivity = (hourlyActivity as any[]).map(item => ({
            hour: `${item.hour}时`,
            count: Number(item.count)
        }));

        const result = {
            hourlyActivity: formattedHourlyActivity,
            weekdayActivity: formattedWeekdayActivity,
            userReturnRate: userReturnRate
        };

        await this.redisService.set(cacheKey, JSON.stringify(result, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        }), 3600);
        return responseBundler(ResponseCode.SUCCESS, result);
    }
}
