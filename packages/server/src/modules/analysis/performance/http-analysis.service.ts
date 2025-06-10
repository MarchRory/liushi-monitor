import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { BaseHttpOverviewSearch } from '../dto/base.dto';
import { IHttpOverview } from '../types/http';
import { responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';
import dataUtils from 'src/utils/common/time';

@Injectable()
export class HttpAnalysisService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly redisService: RedisService
    ) {
    }

    async calculateHttpOverView(dto: BaseHttpOverviewSearch) {
        const { startTime, endTime, url, interfaceUrl, refresh } = dto;

        // 生成Redis缓存键
        const cacheKey = `http_overview:${url}:${interfaceUrl}:${new Date(startTime).toISOString()}:${new Date(endTime).toISOString()}`;

        // 如果不强制刷新，尝试从缓存获取数据
        if (!refresh) {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                return responseBundler(ResponseCode.SUCCESS, JSON.parse(cachedData))
            }
        }

        // 构建基础查询条件
        const baseWhere: any = {
            timestamp: {
                gte: new Date(startTime),
                lte: new Date(endTime)
            },
            isDeleted: false
        };

        // 添加URL筛选条件（如果不是通配符）
        if (url !== '*') {
            baseWhere.url = url;
        }

        // 添加接口URL筛选条件（如果不是通配符）
        if (interfaceUrl !== '*') {
            baseWhere.interfaceUrl = interfaceUrl;
        }

        // 1. 请求总量
        const totalRequests = await this.prismaService.httpRequest.count({
            where: baseWhere
        });

        // 2. 平均响应时间（value字段存储响应时间，单位为毫秒）
        const avgResponseTime = await this.prismaService.httpRequest.aggregate({
            _avg: {
                value: true
            },
            where: baseWhere
        });

        // 3. 成功请求总量（状态码2xx）
        const successfulRequests = await this.prismaService.httpRequest.count({
            where: {
                ...baseWhere,
                responseCode: {
                    gte: 200,
                    lt: 300
                }
            }
        });

        // 4. 失败请求总量（状态码非2xx）
        const failedRequests = totalRequests - successfulRequests;

        // 5. 计算成功率和错误率
        const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
        const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

        // 6. 请求方法分布
        const methodDistribution = await this.prismaService.httpRequest.groupBy({
            by: ['method'],
            _count: {
                method: true
            },
            where: baseWhere
        });

        // 7. 请求状态码分布
        const statusCodeDistribution = await this.prismaService.httpRequest.groupBy({
            by: ['responseCode'],
            _count: {
                responseCode: true
            },
            where: baseWhere
        });

        // 8. 接口调用频率（按interfaceUrl分组）
        const interfaceUsage = await this.prismaService.httpRequest.groupBy({
            by: ['interfaceUrl'],
            _count: {
                id: true
            },
            where: baseWhere,
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
        });

        // 9. 按时间段统计请求量（按小时分组）, 动态构建原生SQL
        let query = Prisma.sql`
            SELECT 
                DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour, 
                CAST(COUNT(*) AS CHAR) as count 
            FROM http_request 
            WHERE 
                timestamp >= ${new Date(startTime)} 
                AND timestamp <= ${new Date(endTime)} 
                AND isDeleted = false 
        `;
        if (url !== '*') {
            query = Prisma.sql`${query} AND url = ${url}`;
        }
        if (interfaceUrl !== '*') {
            query = Prisma.sql`${query} AND interface_url = ${interfaceUrl}`;
        }
        query = Prisma.sql`${query} GROUP BY hour ORDER BY hour ASC`;
        const hourlyDistribution = (await this.prismaService.$queryRaw(query)) as IHttpOverview['hourlyDistribution']
        for (const distribution of hourlyDistribution) {
            distribution.hour = dataUtils.formatDateTime(new Date(distribution.hour))
        }

        // 10. 慢请求分析（响应时间超过500ms的请求）
        const slowRequests = await this.prismaService.httpRequest.count({
            where: {
                ...baseWhere,
                value: {
                    gt: 500
                }
            }
        });
        const slowRequestRate = totalRequests > 0 ? (slowRequests / totalRequests) * 100 : 0;

        // 11. 今日请求量（如果时间范围包含今天）
        const today = new Date();
        today.setHours(0, 0, 0, 0)
        let todayRequests = 0;
        if (new Date(startTime) <= today && new Date(endTime) >= today) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            todayRequests = await this.prismaService.httpRequest.count({
                where: {
                    ...baseWhere,
                    timestamp: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            })
        }

        // 构建结果对象
        const result: IHttpOverview = {
            totalRequests,
            todayRequests,
            avgResponseTime: avgResponseTime._avg.value || 0,
            successRate: parseFloat(successRate.toFixed(2)),
            errorRate: parseFloat(errorRate.toFixed(2)),
            methodDistribution: methodDistribution.map(item => ({
                method: item.method,
                count: item._count.method,
                percentage: parseFloat(((item._count.method / totalRequests) * 100).toFixed(2))
            })),
            statusCodeDistribution: statusCodeDistribution.map(item => ({
                statusCode: item.responseCode,
                count: item._count.responseCode,
                percentage: parseFloat(((item._count.responseCode / totalRequests) * 100).toFixed(2))
            })),
            interfaceUsage: interfaceUsage.map(item => ({
                interfaceUrl: item.interfaceUrl,
                count: item._count.id,
                percentage: parseFloat(((item._count.id / totalRequests) * 100).toFixed(2))
            })),
            hourlyDistribution,
            slowRequests: {
                count: slowRequests,
                percentage: parseFloat(slowRequestRate.toFixed(2))
            }
        };
        // 将结果缓存到Redis（过期时间设为1小时）
        await this.redisService.set(cacheKey, JSON.stringify(result), 3600);

        return responseBundler(ResponseCode.SUCCESS, result)
    }
}