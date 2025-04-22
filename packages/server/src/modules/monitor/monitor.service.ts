import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { IBaseTransformedData, IPluginTransportDataBaseInfo } from './types';

@Injectable()
export class MonitorService implements OnModuleInit, OnModuleDestroy {
    constructor(
        private readonly prismaService: PrismaService,
    ) {

    }
    async saveLog(decryptedData: IBaseTransformedData) {
        const { type, eventName, deviceInfo, userInfo, collectedData } = decryptedData
        console.log('顺利接收: ', decryptedData)
    }

    onModuleInit() {

    }

    onModuleDestroy() {

    }
}
