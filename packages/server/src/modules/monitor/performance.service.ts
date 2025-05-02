import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BaseIndicatorTypes } from './types';
import { LogProcessor } from './processor/log.processor';
import { TransformedLogData } from './transformer';
import {
    Performance as PerformanceModel,
    Producer as ProducerModel,
    HttpRequest as HttpRequestModel
} from '.prisma/client';
import { PrismaTransactionClient } from 'src/types/prisma';
import { ConfigService } from '@nestjs/config';
import { IWriteLogsBufferConfig } from 'src/types/envConfig';

type SavedLogsWithProducer = {
    producer: Omit<ProducerModel, 'id'>[]
    logs: Omit<PerformanceModel | HttpRequestModel, 'id'>[]
}

@Injectable()
export class PerformanceService implements OnModuleInit {
    private readonly logger = new Logger(PerformanceService.name);
    private processor: LogProcessor<TransformedLogData, BaseIndicatorTypes<'performance'>>;
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService<IWriteLogsBufferConfig>
    ) { }
    onModuleInit() {
        this.processor = new LogProcessor<TransformedLogData, BaseIndicatorTypes<'performance'>>(
            this.prismaService,
            {
                eventType: 'performance',
                maxBufferSize: +this.configService.get('MAXSIZE_OF_PERFORMANCE_BUFFER'),
                processor: this.processPerformanceLogs.bind(this),
                flushInterval: +this.configService.get('TIME_INTERVAL_OF_WARITING_PERFORMANCE_LOGS')
            }
        )
    }

    async receiveLog(
        indicator: BaseIndicatorTypes<'performance'>,
        log: TransformedLogData
    ) {
        if (['first_screen_fp', 'first_screen_fcp', 'first_screen_lcp', 'first_screen_ttfb'].includes(indicator)) {
            this.processor.addLog(indicator, log, true)
        } else {
            this.processor.addLog(indicator, log)
        }
    }
    private async processPerformanceLogs(
        prisma: PrismaService,
        indicator: BaseIndicatorTypes<'performance'>,
        logs: TransformedLogData[]
    ) {
        this.logger.debug(`正在处理 ${logs.length} 条 ${indicator} 性能日志`);
        const waitingToSaveData: SavedLogsWithProducer = {
            producer: [],
            logs: []
        }
        const producerSet = new Set<number>()
        logs.forEach((item) => {
            Reflect.deleteProperty(item, 'eventTypeName')
            Reflect.deleteProperty(item, 'indicatorName')
            if (!producerSet.has(item.userInfo.userId)) {
                waitingToSaveData.producer.push({ ...item.deviceInfo, ...item.userInfo, isDeleted: false })
            }
            waitingToSaveData.logs.push({
                eventTypeId: item.eventTypeId!,
                indicatorId: item.indicatorId!,
                url: item.url,
                timestamp: item.timestamp as unknown as Date,
                producerId: item.userInfo.userId,
                isDeleted: false,
                ...(item.collectedData as Pick<PerformanceModel, 'rating' | "detail" | "value">)
            })
        })
        await prisma.$transaction(async (client) => {
            await client.producer.createMany({
                data: waitingToSaveData.producer,
                skipDuplicates: true
            })
            switch (indicator) {
                case 'http':
                    await this.saveHttpLog(waitingToSaveData.logs, client)
                    break;
                case 'vue3_spa_page_load_time':
                    await this.saveSpaloadLog(waitingToSaveData.logs, client)
                    break;
                case 'first_screen_fcp':
                case 'first_screen_fp':
                case "first_screen_lcp":
                case 'first_screen_ttfb':
                    await this.saveScreenPerformanceLogs(waitingToSaveData.logs, client)
                    break;
                default:
                    break;
            }
            producerSet.clear()
        })
    }
    private async saveHttpLog(savedDatas: SavedLogsWithProducer['logs'], client: PrismaTransactionClient) {
        await client.httpRequest.createMany({
            data: savedDatas as Omit<HttpRequestModel, 'id'>[]
        })
    }
    private async saveSpaloadLog(savedDatas: SavedLogsWithProducer['logs'], client: PrismaTransactionClient) {
        await client.performance.createMany({
            data: savedDatas as Omit<PerformanceModel, 'id'>[]
        })
    }
    private async saveScreenPerformanceLogs(savedDatas: SavedLogsWithProducer['logs'], client: PrismaTransactionClient) {
        await client.performance.createMany({
            data: savedDatas as Omit<PerformanceModel, 'id'>[]
        })
    }
}