import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { BaseErrorOverviewSearch, BaseSpecificErrorTable } from '../dto/base.dto';
import { listBundler, responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';

@Injectable()
export class ErrorAnalysisService {
    private readonly logger: Logger = new Logger(ErrorAnalysisService.name);
    private readonly CACHE_TTL = 60 * 30; // 缓存30分钟

    constructor(
        private readonly redisService: RedisService,
        private readonly prismaService: PrismaService,
    ) { }

    async calculateErrorOverview(dto: BaseSpecificErrorTable) {
        const { startTime, endTime, refresh, errorTypeId } = dto;
        const cacheKey = `error:overview:${startTime}:${endTime}`;

        // 如果要求刷新或者缓存中没有数据，则重新查询
        if (refresh) {
            await this.redisService.del(cacheKey);
        } else {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        const baseWhere = {
            timestamp: {
                gte: new Date(startTime),
                lte: new Date(endTime)
            },
            isDeleted: false
        }
        if (errorTypeId !== '*') {
            baseWhere['indicatorId'] = +errorTypeId
        }
        // 查询已修复错误数
        const fixedErrors = await this.prismaService.error.count({
            where: {
                ...baseWhere,
                isFixed: true
            }
        });



        // 查询总错误数
        const totalErrors = await this.prismaService.error.count({
            where: {
                ...baseWhere,
            }
        });



        const activeErrors = totalErrors - fixedErrors;

        // 按时间分组的错误数
        const errorsByTime = await this.groupErrorsByTime(startTime, endTime, baseWhere);

        // 按错误类型分组
        const errorsByType = await this.groupErrorsByType(startTime, endTime, baseWhere);

        // 按URL分组
        const errorsByUrl = await this.groupErrorsByUrl(startTime, endTime, baseWhere);

        // 获取Top错误列表
        const topErrors = await this.getTopErrors(startTime, endTime, baseWhere);

        const result = {
            totalErrors,
            fixedErrors,
            activeErrors,
            errorsByTime,
            errorsByType,
            errorsByUrl,
            topErrors
        };

        // 缓存结果
        await this.redisService.set(
            cacheKey,
            JSON.stringify(result),
            this.CACHE_TTL
        );

        return responseBundler(ResponseCode.SUCCESS, result)
    }

    async calculateSpecificErrorList(dto: BaseSpecificErrorTable) {
        const { startTime, endTime, refresh, errorTypeId } = dto;
        const cacheKey = `error:specific:${errorTypeId}:${startTime}:${endTime}`;

        // 如果要求刷新或者缓存中没有数据，则重新查询
        if (refresh) {
            await this.redisService.del(cacheKey);
        } else {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        // 查询指定类型的错误列表
        const errors = await this.prismaService.error.findMany({
            where: {
                timestamp: {
                    gte: new Date(startTime),
                    lte: new Date(endTime)
                },
                isDeleted: false,
                indicatorId: parseInt(errorTypeId)
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        // 处理错误数据，解析JSON字段
        const processedErrors = errors.map(error => {
            try {
                const codeLocation = error.codeLocation ? JSON.parse(error.codeLocation) : {};
                const props = error.props ? JSON.parse(error.props) : {};

                return {
                    ...error,
                    codeLocation,
                    props
                };
            } catch (e) {
                this.logger.error(`解析错误数据失败: ${e.message}`, e.stack);
                return error;
            }
        });

        const result = {
            total: processedErrors.length,
            list: processedErrors
        };

        // 缓存结果
        await this.redisService.set(
            cacheKey,
            JSON.stringify(result),
            this.CACHE_TTL
        );

        return responseBundler(ResponseCode.SUCCESS, listBundler(result.total, result.list))
    }

    // 按时间分组统计错误数量
    private async groupErrorsByTime(startTime: string | Date, endTime: string | Date, where: object) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));


        // 获取所有满足条件的错误记录
        const errors = await this.prismaService.error.findMany({
            where: {
                ...where,
            },
            select: {
                timestamp: true
            }
        });

        // 在内存中进行分组计算
        const timeGroups = new Map();

        errors.forEach(error => {
            const date = new Date(error.timestamp);
            let timeKey;

            if (diffDays > 30 || diffDays > 7) {
                // 按天分组
                timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else {
                // 按小时分组
                timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00:00`;
            }

            timeGroups.set(timeKey, (timeGroups.get(timeKey) || 0) + 1);
        });

        // 转换为数组并排序
        const result = Array.from(timeGroups.entries()).map(([time_group, count]) => ({
            time_group,
            count
        })).sort((a, b) => a.time_group.localeCompare(b.time_group));

        return result;
    }

    // 按错误类型分组
    private async groupErrorsByType(startTime: string | Date, endTime: string | Date, where: object) {
        const errors = await this.prismaService.error.groupBy({
            by: ['srcName'],
            where: {
                ...where,
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 10
        });

        return errors.map(item => ({
            type: item.srcName,
            count: item._count.id
        }));
    }

    // 按URL分组
    private async groupErrorsByUrl(startTime: string | Date, endTime: string | Date, where: object) {
        const errors = await this.prismaService.error.groupBy({
            by: ['url'],
            where: {
                ...where,
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 10
        });

        return errors.map(item => ({
            url: item.url,
            count: item._count.id
        }));
    }

    // 获取Top错误列表
    private async getTopErrors(startTime: string | Date, endTime: string | Date, where: object) {
        // 步骤1: 按URL和错误类型分组计数
        const errorGroups = await this.prismaService.error.groupBy({
            by: ['url', 'srcName'],
            where: {
                ...where,
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 100
        });

        // 步骤2: 对每个分组获取最新的错误记录
        const result = [];

        for (const group of errorGroups) {
            const latestError = await this.prismaService.error.findFirst({
                where: {
                    url: group.url,
                    srcName: group.srcName,
                    timestamp: {
                        gte: new Date(startTime),
                        lte: new Date(endTime)
                    },
                    isDeleted: false
                },
                orderBy: {
                    timestamp: 'desc'
                }
            });

            if (latestError) {
                // @ts-ignore
                result.push({
                    ...latestError,
                    count: group._count.id
                });
            }
        }

        return result;
    }
}