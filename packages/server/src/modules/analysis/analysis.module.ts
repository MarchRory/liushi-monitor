import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { UserhehaviorAnalysisService } from './userBehavior/userbehavior-analysis.service'
import { PerformanceAnalysisService } from './performance/performance-analysis.service';
import { ErrorAnalysisService } from './error/error-analysis.service';
import { PerformanceAnalysisController } from './performance/performance-analysis.controller';
import { UserbehaviorAnalysisController } from './userBehavior/userbehavior-analysis.controller';
import { ErrorAnalysisController } from './error/error-analysis.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { RedisModule } from 'src/config/redis/redis.module';
import { TrackingService } from '../tracking/tracking.service';
import { HttpAnalysisService } from './performance/http-analysis.service';

@Module({
  imports: [
    PrismaModule,
    RedisModule
  ],
  controllers: [
    PerformanceAnalysisController,
    UserbehaviorAnalysisController,
    ErrorAnalysisController,
  ],
  providers: [
    PrismaService,
    RedisService,
    UserhehaviorAnalysisService,
    PerformanceAnalysisService,
    HttpAnalysisService,
    ErrorAnalysisService,
    TrackingService
  ],
})
export class AnalysisModule { }
