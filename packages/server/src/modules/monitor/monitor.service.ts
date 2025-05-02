import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ErrorService } from './error.service';
import { PerformanceService } from './performance.service';
import { BehaviorService } from './userbehavior.service';
import { BaseIndicatorTypes, IBaseTransformedData } from './types';
import { logTransformer } from './transformer/index'
import { TrackingService } from '../tracking/tracking.service';

@Injectable()
export class MonitorService implements OnModuleInit, OnModuleDestroy {
    private eventTypeNameToIdMap: Record<string, number> = {}
    private indicatorNameToIdMap: Record<string, number> = {}
    constructor(
        private readonly trackingService: TrackingService,
        private readonly errorService: ErrorService,
        private readonly performanceService: PerformanceService,
        private readonly behaviorService: BehaviorService
    ) {

    }

    async saveLog(decryptedData: IBaseTransformedData[]) {
        const transformedLog = logTransformer(decryptedData)
        transformedLog.forEach((item) => {
            item['eventTypeId'] = this.eventTypeNameToIdMap[item.eventTypeName]
            item['indicatorId'] = this.indicatorNameToIdMap[item.indicatorName]
            if (item.eventTypeName === 'error') {
                this.errorService.receiveLog(item.indicatorName as BaseIndicatorTypes<'error'>, item)
            } else if (item.eventTypeName === 'performance') {
                this.performanceService.receiveLog(item.indicatorName as BaseIndicatorTypes<'performance'>, item)
            } else if (item.eventTypeName === 'userBehavior') {
                this.behaviorService.receiveLog(item.indicatorName as BaseIndicatorTypes<'userBehavior'>, item)
            }
        })
    }

    async onModuleInit() {
        const eventMapCache = await this.trackingService.getEventMapCache()
        Object.entries(eventMapCache).forEach(([id, { eventTypeName }]) => this.eventTypeNameToIdMap[eventTypeName] = +id)

        const indicatorMapCache = await this.trackingService.getIndicatorMapCache()
        Object.entries(indicatorMapCache).forEach(([id, { indicatorName }]) => this.indicatorNameToIdMap[indicatorName] = +id)
    }

    onModuleDestroy() {
    }
}
