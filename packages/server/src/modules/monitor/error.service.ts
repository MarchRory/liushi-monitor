import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Error as ErrorModel, Producer as ProducerModel } from '.prisma/client'
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BaseIndicatorTypes, TransformedErrorData } from './types';
import { TransformedLogData } from './transformer';
import { LogProcessor } from './processor/log.processor';
import { UN_SIT_NUMBER_VALUE } from 'src/common/constant';
import { ConfigService } from '@nestjs/config';
import { IWriteLogsBufferConfig } from 'src/types/envConfig';

type SavedLogsWithProducer = {
    producer: Omit<ProducerModel, 'id'>[]
    logs: Omit<ErrorModel, 'id'>[]
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
                responsiblePersonId: UN_SIT_NUMBER_VALUE,
                isFixed: false,
                ...(item.collectedData as TransformedErrorData)
            })
        })

        await prisma.$transaction(async (client) => {
            await client.producer.createMany({
                data: waitingToSaveData.producer,
                skipDuplicates: true
            })
            await client.error.createMany({
                data: waitingToSaveData.logs
            })
        })
    }
}