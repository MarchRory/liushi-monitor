import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BaseEventTypes } from '../types';

// 通用处理器接口
export interface LogProcessorOptions<T, K extends string> {
    eventType: BaseEventTypes;

    // 每个事件类型的最大缓冲大小
    maxBufferSize?: number;

    flushInterval: number

    // 数据处理器，决定如何保存特定类型的日志
    processor: (
        prisma: PrismaService,
        indicator: K,
        logs: T[]
    ) => Promise<void>;
}

@Injectable()
export class LogProcessor<T, K extends string> implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(LogProcessor.name);
    private logBuffer: Record<string, T[]> = {};

    private intervalId: NodeJS.Timeout;

    private readonly flushInterval: number;

    private readonly maxBufferSize: number;
    private readonly eventType: BaseEventTypes;
    private readonly processor: LogProcessorOptions<T, K>['processor'];

    constructor(
        private readonly prismaService: PrismaService,
        options: LogProcessorOptions<T, K>,
    ) {
        this.eventType = options.eventType;
        this.flushInterval = options.flushInterval || 1000 * 10; // 默认30秒
        this.maxBufferSize = options.maxBufferSize || 100;   // 默认100条
        this.processor = options.processor;
        this.intervalId = setInterval(() => this.flushAllLogs(), this.flushInterval)
        this.logger.debug(`初始化 ${this.eventType} 定时日志任务处理器,  暂存限额: ${this.maxBufferSize}`);
    }

    onModuleInit() {
        this.logger.debug(`启动 ${this.eventType} 日志处理...`);
    }

    onModuleDestroy() {
        this.logger.debug(`终止 ${this.eventType} 日志处理...`);
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        // 确保在应用关闭前刷新所有剩余日志
        return this.flushAllLogs();
    }


    /**
     * 添加日志到缓冲区
     * @param indicator 指标
     * @param log 日志
     * @param immediate 是否跳过缓冲, 立即写入数据库, 默认false
     * @returns void
     */
    addLog(indicator: K, log: T, immediate: boolean = false) {
        if (immediate) {
            return this.processor(this.prismaService, indicator, [log])
        }

        // 初始化缓冲区(如果不存在)
        if (!this.logBuffer[indicator]) {
            this.logBuffer[indicator] = [];
        }

        // 添加日志
        this.logBuffer[indicator].push(log);
        this.logger.debug(`${indicator} 日志添加成功`)

        // 如果达到阈值，触发刷新
        if (this.logBuffer[indicator].length >= this.maxBufferSize) {
            this.flushLogsByIndicator(indicator);
        }
    }

    /**
     * 批量添加日志到缓冲区
     * @param indicator 
     * @param logs 
     * @param immediate 是否跳过缓冲, 立即写入数据库, 默认false
     * @returns void
     */
    addLogs(indicator: K, logs: T[], immediate: boolean = false) {
        if (immediate) {
            return this.processor(this.prismaService, indicator, logs)
        }

        if (!logs || logs.length === 0) return;

        // 初始化缓冲区(如果不存在)
        if (!this.logBuffer[indicator]) {
            this.logBuffer[indicator] = [];
        }

        // 添加日志
        this.logBuffer[indicator] = [...this.logBuffer[indicator], ...logs];

        // 如果达到阈值，触发刷新
        if (this.logBuffer[indicator].length >= this.maxBufferSize) {
            this.flushLogsByIndicator(indicator);
        }
    }

    /**
     * 刷新所有类型的日志
     */
    private async flushAllLogs(): Promise<void> {
        this.logger.debug('启动新一轮日志入库检测')
        const indicators = Object.keys(this.logBuffer) as K[];
        for (const indicator of indicators) {
            await this.flushLogsByIndicator(indicator);
        }
    }

    /**
     * 刷新特定类型的日志
     */
    private async flushLogsByIndicator(indicator: K): Promise<void> {
        if (!this.logBuffer[indicator] || this.logBuffer[indicator].length === 0) {
            return;
        }

        // 取出当前缓冲区内容并清空
        const logs = [...this.logBuffer[indicator]];
        this.logBuffer[indicator] = [];

        try {
            this.logger.debug(`正在处理 ${logs.length} 条 ${indicator} 日志`)
            await this.processor(this.prismaService, indicator, logs);
            this.logger.debug(`成功入库 ${logs.length} 条 ${this.eventType} - ${indicator} 暂存日志`);
        } catch (error) {
            this.logger.error(`清空 ${this.eventType} - ${indicator} 日志出错:`, error);

            // 错误处理: 将日志放回缓冲区
            if (!this.logBuffer[indicator]) {
                this.logBuffer[indicator] = [];
            }
            this.logBuffer[indicator] = [...this.logBuffer[indicator], ...logs];
        }
    }

    /**
     * 获取当前缓冲区状态 - 用于调试和监控
     */
    getBufferStatus(): Record<string, number> {
        const status: Record<string, number> = {};

        for (const indicator in this.logBuffer) {
            status[indicator] = this.logBuffer[indicator].length;
        }

        return status;
    }
}