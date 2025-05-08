import { Module } from '@nestjs/common';
import { HeatMapService } from './heat-map.service';
import { HeatMapController } from './heat-map.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Module({
  controllers: [HeatMapController],
  providers: [
    HeatMapService,
    PrismaService,
  ],
})
export class HeatMapModule { }
