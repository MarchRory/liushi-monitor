import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as crypto from 'node:crypto'
import {
    Exposure as ExposureModel,
    PathStack as PathStackModel,
    Views as ViewsModel,
    Interaction as InteractionModel,
    Producer as ProducerModel,
    Prisma
} from '.prisma/client'
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BaseIndicatorTypes } from './types';
import { TransformedLogData } from './transformer';
import { ConfigService } from '@nestjs/config';
import { IWriteLogsBufferConfig } from 'src/types/envConfig';
import { LogProcessor } from './processor/log.processor';
import { PrismaTransactionClient } from 'src/types/prisma';
import { TrackingService } from '../tracking/tracking.service';
import { UN_SIT_NUMBER_VALUE } from 'src/common/constant';

type SavedLogsWithProducer = {
    producer: Omit<ProducerModel, 'id'>[]
    logs: Omit<ExposureModel | PathStackModel & { url: string, timestamp: Date, producerId: number } | ViewsModel | InteractionModel, 'id'>[]
}

type PreTransformedPageExposureData = Omit<PathStackModel, 'id'> & Pick<ExposureModel, 'value' | 'producerId' | "url" | "timestamp">

@Injectable()
export class BehaviorService implements OnModuleInit {
    private readonly logger = new Logger(BehaviorService.name);
    private processor: LogProcessor<TransformedLogData, BaseIndicatorTypes<'userBehavior'>>;
    private readonly stackMap: Map<string, Pick<PathStackModel, 'stackHash' | "id">> = new Map()
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService<IWriteLogsBufferConfig>,
        private readonly trackingService: TrackingService
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
                ...(item.collectedData || {})
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
            switch (indicator) {
                case 'defaultClick':
                    await this.saveDefaultClickLog(waitingToSaveData.logs, client)
                    break;
                case 'compClick':
                    await this.saveCompClickLog(waitingToSaveData.logs, client)
                    break;
                case 'pv':
                case 'uv':
                    await this.saveViewsLog(waitingToSaveData.logs, client)
                    break;
                case 'page_exposure':
                    await this.savePageExposureLog(waitingToSaveData.logs, client)
                    break;
                case 'module_exposure':
                    await this.saveModuleExposureLog(waitingToSaveData.logs, client)
                    break;
                default:
                    break;
            }
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        })
    }

    private async saveDefaultClickLog(savedDatas: SavedLogsWithProducer['logs'], client: PrismaTransactionClient) {
        await client.interaction.createMany({
            data: savedDatas as Omit<InteractionModel, 'id'>[]
        })
    }

    private async saveCompClickLog(savedDatas: SavedLogsWithProducer['logs'], client: PrismaTransactionClient) {
        await client.interaction.createMany({
            data: savedDatas as Omit<InteractionModel, 'id'>[]
        })
    }

    private async saveViewsLog(savedDatas: SavedLogsWithProducer['logs'], client: PrismaTransactionClient) {
        await client.views.createMany({
            data: savedDatas as Omit<ViewsModel, 'id'>[]
        })
    }

    private async savePageExposureLog(savedDatas: SavedLogsWithProducer['logs'], client: PrismaTransactionClient) {
        const pathStackRecords: Omit<PathStackModel, 'id'>[] = []
        for (const data of (savedDatas as unknown as PreTransformedPageExposureData[])) {
            if (this.stackMap.has(data.stack)) continue
            const stackHash = crypto.createHash('sha256').update(data.stack).digest('hex')
            this.stackMap.set(data.stack, { stackHash, id: UN_SIT_NUMBER_VALUE })
            pathStackRecords.push({
                eventTypeId: data.eventTypeId,
                indicatorId: data.indicatorId,
                stack: data.stack,
                stackHash,
                isDeleted: false
            })
        }
        await client.pathStack.createMany({
            data: pathStackRecords,
            skipDuplicates: true
        })

        let theLastestPathStackHashs: string[] = []
        for (const [_, { stackHash }] of this.stackMap) {
            theLastestPathStackHashs.push(stackHash)
        }
        const pathStacks = await client.pathStack.findMany({
            where: {
                stackHash: {
                    in: theLastestPathStackHashs
                }
            },
            select: { stack: true, id: true }
        });

        for (const { id, stack } of pathStacks) {
            const cache = this.stackMap.get(stack)
            if (!cache || (cache && cache.id !== UN_SIT_NUMBER_VALUE)) continue

            cache.id = +id
            this.stackMap.set(stack, cache)
        }
        const exposureData: Omit<ExposureModel, 'id'>[] = (savedDatas as unknown as PreTransformedPageExposureData[]).map((item) => ({
            eventTypeId: item.eventTypeId,
            indicatorId: item.indicatorId,
            isDeleted: false,
            producerId: item.producerId,
            pathStackId: this.stackMap.get(item.stack)!.id,
            url: item.url,
            timestamp: item.timestamp,
            value: item.value,
        }))
        await client.exposure.createMany({
            data: exposureData
        })
    }

    private async saveModuleExposureLog(savedDatas: SavedLogsWithProducer['logs'], client: PrismaTransactionClient) { }
}