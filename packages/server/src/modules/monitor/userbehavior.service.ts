import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
    Exposure as ExposureModel,
    PathStack as PathStackModel,
    Views as ViewsModel,
    Interaction as InteractionModel,
    Producer as ProducerModel
} from '.prisma/client'
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BaseIndicatorTypes } from './types';
import { TransformedLogData } from './transformer';
import { ConfigService } from '@nestjs/config';
import { IWriteLogsBufferConfig } from 'src/types/envConfig';
import { LogProcessor } from './processor/log.processor';
import { PrismaTransactionClient } from 'src/types/prisma';

type SavedLogsWithProducer = {
    producer: Omit<ProducerModel, 'id'>[]
    logs: Omit<ExposureModel | PathStackModel | ViewsModel | InteractionModel, 'id'>[]
}

@Injectable()
export class BehaviorService implements OnModuleInit {
    private readonly logger = new Logger(BehaviorService.name);
    private processor: LogProcessor<TransformedLogData, BaseIndicatorTypes<'userBehavior'>>;
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService<IWriteLogsBufferConfig>
    ) { }
    onModuleInit() {
        this.processor = new LogProcessor<TransformedLogData, BaseIndicatorTypes<'userBehavior'>>(
            this.prismaService,
            {
                eventType: 'userBehavior',
                maxBufferSize: +this.configService.get('MAXSIZE_OF_USERBEHAVIOR_BUFFER'),
                flushInterval: +this.configService.get('TIME_INTERVAL_OF_WARITING_USERBEHAVIOR_LOGS'),
                processor: this.processPerformanceLogs.bind(this)
            }
        )
    }

    async receiveLog(indicator: BaseIndicatorTypes<'userBehavior'>, log: TransformedLogData) {
        this.processor.addLog(indicator, log)
    }

    private async processPerformanceLogs(
        prisma: PrismaService,
        indicator: BaseIndicatorTypes<'userBehavior'>,
        logs: TransformedLogData[]
    ) {
        this.logger.debug(`正在处理 ${logs.length} 条 ${indicator} 行为日志`);
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
                ...item.collectedData
            })
        })

        await prisma.$transaction(async (client) => {
            await client.producer.createMany({
                data: waitingToSaveData.producer,
                skipDuplicates: true
            })
        })
    }

    private async saveDefaultClickLog(savedDatas: SavedLogsWithProducer['logs'], clint: PrismaTransactionClient) { }

    private async saveCompClickLog(savedDatas: SavedLogsWithProducer['logs'], clint: PrismaTransactionClient) { }

    private async saveViewsLog(savedDatas: SavedLogsWithProducer['logs'], clint: PrismaTransactionClient) { }

    private async saveExposureLog(savedDatas: SavedLogsWithProducer['logs'], clint: PrismaTransactionClient) { }
}