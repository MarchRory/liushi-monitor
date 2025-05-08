import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
    Error as ErrorModel,
    Producer as ProducerModel,
    Prisma
} from '.prisma/client'
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BaseIndicatorTypes, TransformedErrorData } from './types';
import { TransformedLogData } from './transformer';
import { LogProcessor } from './processor/log.processor';
import { ConfigService } from '@nestjs/config';
import { IWriteLogsBufferConfig } from 'src/types/envConfig';

type SavedLogsWithProducer = {
    producer: Omit<ProducerModel, 'id'>[]
    logs: Omit<ErrorModel, 'id' | "responsiblePersonId">[]
}

@Injectable()
export class ErrorService implements OnModuleInit {
    private readonly logger = new Logger(ErrorService.name)
    private processor: LogProcessor<TransformedLogData, BaseIndicatorTypes<'error'>>
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService<IWriteLogsBufferConfig>
    ) { }
    onModuleInit() {
        this.processor = new LogProcessor<TransformedLogData, BaseIndicatorTypes<'error'>>(
            this.prismaService,
            {
                eventType: 'error',
                maxBufferSize: +this.configService.get('MAXSIZE_OF_ERROR_BUFFER'),
                flushInterval: +this.configService.get('TIME_INTERVAL_OF_WARITING_ERROR_LOGS'),
                processor: this.processPerformanceLogs.bind(this)
            }
        )
    }

    async receiveLog(indicator: BaseIndicatorTypes<'error'>, log: TransformedLogData) {
        this.processor.addLog(indicator, log, true)
    }

    private async processPerformanceLogs(
        prisma: PrismaService,
        indicator: BaseIndicatorTypes<'error'>,
        logs: TransformedLogData[]
    ) {
        this.logger.debug(`正在处理 ${logs.length} 条 ${indicator} 报错日志`);
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
                isFixed: false,
                ...(item.collectedData as TransformedErrorData)
            })
        })

        prisma.$transaction(async (client) => {
            let retryCnt = 0
            while (retryCnt < 5) {
                try {
                    await client.producer.createMany({
                        data: waitingToSaveData.producer,
                        skipDuplicates: true
                    })
                    break
                } catch (error) {
                    if (error.code === 'P2034') {
                        retryCnt++
                        continue
                    }
                    throw error
                }
            }
            await client.error.createMany({
                data: waitingToSaveData.logs
            })
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        })
    }
}