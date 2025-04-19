import { Injectable } from '@nestjs/common';
import { FindListBaseDto } from 'src/common/dtos/find-list';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { EventItemEntity } from './entities/event.entity';
import { ResponseCode } from 'src/config/response/codeMap';
import { responseBundler, listBundler } from 'src/utils/bundler/response';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class TrackingService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async findEventsList(dto: FindListBaseDto) {
        const pageNum = Math.max(+dto.pageNum || 1, 1);
        const pageSize = Math.max(+dto.pageSize || 10, 1, 100); // 限制最大100条
        const skip = (pageNum - 1) * pageSize;

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
            console.log('id: ', item.id, indicatorCount)
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
        return responseBundler(ResponseCode.SUCCESS)
    }

    async removeEvent(id: number) {
        const event = await this.prismaService.trackEventType.findUnique({
            where: {
                id,
                isDeleted: false
            }
        })
        if (!event) return responseBundler(ResponseCode.DB_ERROR, null, "待删除的事件不存在")
        return this.updateEvent({ ...event, isDeleted: true })
    }
}
