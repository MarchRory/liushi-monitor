import { Injectable } from '@nestjs/common';
import { FindListBaseDto } from 'src/common/dtos/find-list';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { EventItemEntity } from './entities/event.entity';
import { ResponseCode } from 'src/config/response/codeMap';
import { responseBundler, listBundler } from 'src/utils/bundler/response';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateIndicatorDto, FindIndicatorListDto, UpdateIndicatorDto, } from './dto/indicator.dto'
import { IndicatorItemEntity } from './entities/indicator.entity';
import { RedisService } from 'src/config/redis/redis.service';
import { COMPTYPE_MAP_CACHE, EVENTTYPE_MAP_CACHE, SEARCH_ALL_VALUE } from 'src/common/constant';
import { CreateComponentTypeDto, UpdateComponentTypeDto } from './dto/component-type.dto'
import { ComponentTypeEntity } from './entities/component-type.entity';
import { CreateComponentDto, FindComponentListDto, UpdateComponentDto } from './dto/component.dto';
import { ComponentEntity } from './entities/component.entity';

@Injectable()
export class TrackingService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly redisService: RedisService

    ) { }

    async getEventMapCache() {
        let eventNameMap: string | null | object = await this.redisService.get(EVENTTYPE_MAP_CACHE)
        if (!eventNameMap) {
            eventNameMap = {}
            const eventList = await this.prismaService.trackEventType.findMany({
                where: {
                    isDeleted: false
                },
                skip: 0,
                take: 20,
                select: { eventTypeCn: true, id: true }
            })
            for (const { id, eventTypeCn } of eventList) {
                eventNameMap[id] = eventTypeCn
            }
            this.redisService.set(EVENTTYPE_MAP_CACHE, JSON.stringify(eventNameMap))
        } else {
            eventNameMap = JSON.parse(eventNameMap)
        }
        return eventNameMap as unknown as Record<number, string>
    }

    /******************************** 监控事件大类CRUD ***********************************/
    async findEventsList(dto: FindListBaseDto) {
        const pageNum = Math.max(+dto.pageNum || 1, 1);
        const pageSize = Math.max(+dto.pageSize || 10, 10);
        const skip = (pageNum - 1) * pageSize

        const [list, total] = await Promise.all([
            this.prismaService.trackEventType.findMany({
                where: {
                    isDeleted: false
                },
                skip,
                take: pageSize,
            }),
            this.prismaService.trackEventType.count({ where: { isDeleted: false } }),
        ]);

        const countMap: Record<number, number> = {}
        for (const item of list) {
            const indicatorCount = await this.prismaService.trackIndicator.count({ where: { eventTypeId: item.id, isDeleted: false } })
            countMap[item.id] = indicatorCount
        }

        const res = list.map((item) => new EventItemEntity({ ...item, indicatorCount: countMap[item.id] }))
        return responseBundler(ResponseCode.SUCCESS, listBundler(total, res));
    }

    async createEvent(dto: CreateEventDto) {
        await this.prismaService.trackEventType.create({
            data: {
                ...dto,
                isDeleted: false
            }
        })
        return responseBundler(ResponseCode.SUCCESS)
    }

    async updateEvent(dto: UpdateEventDto) {
        await this.prismaService.trackEventType.update({
            where: {
                id: dto.id
            },
            data: dto
        })

        const eventMapCache = await this.getEventMapCache()
        if (eventMapCache[dto.id] !== dto.eventTypeName) {
            eventMapCache[dto.id] = dto.eventTypeName
            await this.redisService.set(EVENTTYPE_MAP_CACHE, JSON.stringify(eventMapCache))
        }

        return responseBundler(ResponseCode.SUCCESS)
    }

    async removeEvent(id: number) {
        const event = await this.prismaService.trackEventType.findUnique({
            where: {
                id,
                isDeleted: false
            }
        })

        const eventMapCache = await this.getEventMapCache()
        delete eventMapCache[id]
        await this.redisService.set(EVENTTYPE_MAP_CACHE, JSON.stringify(eventMapCache))

        if (!event) return responseBundler(
            ResponseCode.DB_ERROR, null, "待删除的事件不存在")
        return this.updateEvent({ ...event, isDeleted: true })
    }
    /******************************** 监控事件大类CRUD ***********************************/


    /***************************** 事件具体指标CRUD ********************************/
    async findIndicatorsList(dto: FindIndicatorListDto) {
        const pageNum = Math.max(+dto.pageNum || 1, 1);
        const pageSize = Math.max(+dto.pageSize || 10, 10);
        const skip = (pageNum - 1) * pageSize

        const where: { isDeleted: boolean, eventTypeId?: number } = { isDeleted: false }
        if ('eventTypeId' in dto && dto.eventTypeId != SEARCH_ALL_VALUE) {
            where.eventTypeId = +dto.eventTypeId
        }
        const [list, total] = await Promise.all([
            this.prismaService.trackIndicator.findMany({
                where,
                skip,
                take: pageSize,
            }),
            this.prismaService.trackIndicator.count({ where }),
        ]);
        let eventCnNameMap = await this.getEventMapCache()
        const res = list.map((item) => new IndicatorItemEntity({ ...item, eventTypeCn: eventCnNameMap[item.eventTypeId + ''] }))
        return responseBundler(ResponseCode.SUCCESS, listBundler(total, res));
    }

    async createIndicator(dto: CreateIndicatorDto) {
        await this.prismaService.trackIndicator.create({
            data: {
                ...dto,
                isDeleted: false
            }
        })
        return responseBundler(ResponseCode.SUCCESS)
    }

    async updateIndicator(dto: UpdateIndicatorDto) {
        await this.prismaService.trackIndicator.update({
            where: {
                id: dto.id
            },
            data: dto
        })
        return responseBundler(ResponseCode.SUCCESS)
    }

    async removeIndicator(id: number) {
        const event = await this.prismaService.trackIndicator.findUnique({
            where: {
                id,
                isDeleted: false
            }
        })
        if (!event) return responseBundler(
            ResponseCode.DB_ERROR, null, "待删除的指标不存在")
        return this.updateIndicator({ ...event, isDeleted: true })
    }
    /***************************** 事件具体指标CRUD ********************************/


    async getComponentTypeMapCache() {
        let componentTypeMap: string | null | object = await this.redisService.get(COMPTYPE_MAP_CACHE)
        if (!componentTypeMap) {
            componentTypeMap = {}
            const compTypeList = await this.prismaService.trackComponentType.findMany({
                where: {
                    isDeleted: false
                },
                skip: 0,
                take: 20,
                select: { componentTypeCn: true, id: true }
            })
            for (const { id, componentTypeCn } of compTypeList) {
                componentTypeMap[id] = componentTypeCn
            }
            this.redisService.set(COMPTYPE_MAP_CACHE, JSON.stringify(componentTypeMap))
        } else {
            componentTypeMap = JSON.parse(componentTypeMap)
        }
        return componentTypeMap as unknown as Record<number, string>
    }
    /***************************** 监控业务组件大类CRUD ********************************/
    async findComponentTypeList(dto: FindListBaseDto) {
        const pageNum = Math.max(+dto.pageNum || 1, 1);
        const pageSize = Math.max(+dto.pageSize || 10, 10);
        const skip = (pageNum - 1) * pageSize

        const [list, total] = await Promise.all([
            this.prismaService.trackComponentType.findMany({
                where: {
                    isDeleted: false
                },
                skip,
                take: pageSize,
            }),
            this.prismaService.trackComponentType.count({ where: { isDeleted: false } }),
        ]);

        const countMap: Record<number, number> = {}
        for (const item of list) {
            const componentCount = await this.prismaService.trackComponent.count({ where: { componentTypeId: item.id, isDeleted: false } })
            countMap[item.id] = componentCount
        }

        const res = list.map((item) => new ComponentTypeEntity({ ...item, componentCount: countMap[item.id] }))
        return responseBundler(ResponseCode.SUCCESS, listBundler(total, res));
    }

    async createCommonType(dto: CreateComponentTypeDto) {
        await this.prismaService.trackComponentType.create({
            data: {
                ...dto,
                isDeleted: false
            }
        })
        return responseBundler(ResponseCode.SUCCESS)
    }

    async updateComponentType(dto: UpdateComponentTypeDto) {
        await this.prismaService.trackComponentType.update({
            where: {
                id: dto.id
            },
            data: dto
        })

        const compTypeMapCache = await this.getComponentTypeMapCache()
        if (compTypeMapCache[dto.id] !== dto.componentTypeCn) {
            compTypeMapCache[dto.id] = dto.componentTypeCn
            await this.redisService.set(COMPTYPE_MAP_CACHE, JSON.stringify(compTypeMapCache))
        }

        return responseBundler(ResponseCode.SUCCESS)
    }

    async removeComponentType(id: number) {
        const compType = await this.prismaService.trackComponentType.findUnique({
            where: {
                id,
                isDeleted: false
            }
        })

        const compTypeMapCache = await this.getComponentTypeMapCache()
        delete compTypeMapCache[id]
        await this.redisService.set(COMPTYPE_MAP_CACHE, JSON.stringify(compTypeMapCache))

        if (!compType) return responseBundler(
            ResponseCode.DB_ERROR, null, "待删除的事件不存在")
        return this.updateComponentType({ ...compType, isDeleted: true })
    }
    /***************************** 监控业务组件大类CRUD ********************************/


    /***************************** 监控具体业务组件CRUD ********************************/
    async findComponentsList(dto: FindComponentListDto) {
        const pageNum = Math.max(+dto.pageNum || 1, 1);
        const pageSize = Math.max(+dto.pageSize || 10, 10);
        const skip = (pageNum - 1) * pageSize

        const where: { isDeleted: boolean, componentTypeId?: number } = { isDeleted: false }
        if ('componentTypeId' in dto && dto.componentTypeId != SEARCH_ALL_VALUE) {
            where.componentTypeId = +dto.componentTypeId
        }
        const [list, total] = await Promise.all([
            this.prismaService.trackComponent.findMany({
                where,
                skip,
                take: pageSize,
            }),
            this.prismaService.trackComponent.count({ where }),
        ]);
        let compCnNameMap = await this.getComponentTypeMapCache()
        const res = list.map((item) => new ComponentEntity({ ...item, componentTypeCn: compCnNameMap[item.componentTypeId + ''] }))
        return responseBundler(ResponseCode.SUCCESS, listBundler(total, res));
    }

    async createComponent(dto: CreateComponentDto) {
        await this.prismaService.trackComponent.create({
            data: {
                ...dto,
                isDeleted: false
            }
        })
        return responseBundler(ResponseCode.SUCCESS)
    }

    async updateComponent(dto: UpdateComponentDto) {
        await this.prismaService.trackComponent.update({
            where: {
                id: dto.id
            },
            data: dto
        })
        return responseBundler(ResponseCode.SUCCESS)
    }

    async removeComponent(id: number) {
        const comp = await this.prismaService.trackComponent.findUnique({
            where: {
                id,
                isDeleted: false
            }
        })
        if (!comp) return responseBundler(
            ResponseCode.DB_ERROR, null, "待删除的组件不存在")
        return this.updateComponent({ ...comp, isDeleted: true })
    }
    /***************************** 监控具体业务组件CRUD ********************************/
}
