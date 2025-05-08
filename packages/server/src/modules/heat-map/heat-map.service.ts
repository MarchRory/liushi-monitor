import { Injectable } from '@nestjs/common';
import { FindListBaseDto } from 'src/common/dtos/find-list';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateHeatMapBasePicDto, UpdateHeatMapBasePicDto } from './dto/base.dto';
import { listBundler, responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';

@Injectable()
export class HeatMapService {
    constructor(private prisma: PrismaService) { }

    async getBasePicListInHeatMap(query: FindListBaseDto) {
        const { pageNum, pageSize } = query;
        const skip = (+pageNum - 1) * (+pageSize)

        const [total, data] = await Promise.all([
            this.prisma.heatMapBasePic.count(),
            this.prisma.heatMapBasePic.findMany({
                skip,
                take: +pageSize,
            }),
        ]);

        return responseBundler(ResponseCode.SUCCESS, listBundler(total, data))
    }

    async getBasePicById(id: number) {
        const basePic = await this.prisma.heatMapBasePic.findUnique({
            where: { id },
        });

        if (!basePic) {
            throw new Error('底图不存在');
        }

        return responseBundler(ResponseCode.SUCCESS, basePic)
    }

    async createBasePic(data: CreateHeatMapBasePicDto) {
        const basePic = await this.prisma.heatMapBasePic.create({
            data,
        });

        return responseBundler(ResponseCode.SUCCESS, basePic)
    }

    async updateBasePic(id: number, data: UpdateHeatMapBasePicDto) {
        await this.prisma.heatMapBasePic.update({
            where: { id },
            data,
        });
        return responseBundler(ResponseCode.SUCCESS, null)
    }

    async deleteBasePic(id: number) {
        await this.prisma.heatMapBasePic.delete({
            where: { id },
        });

        return responseBundler(ResponseCode.SUCCESS, null)
    }

    async updateBasePicStatus(id: number, status: number) {
        const basePic = await this.prisma.heatMapBasePic.update({
            where: { id },
            data: { status },
        });

        return responseBundler(ResponseCode.SUCCESS, basePic)
    }
}
