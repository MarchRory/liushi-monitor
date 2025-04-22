import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorController } from './monitor.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { RedisModule } from 'src/config/redis/redis.module';
import { DecryptModule } from 'src/config/decrypt/decrypt.module';
import { BullmqModule } from 'src/config/mq/bullmq.module';
import { MonitorScheduler } from './monitor.scheduler';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    DecryptModule,
    BullmqModule
  ],
  controllers: [
    MonitorController
  ],
  providers: [
    MonitorService,
    MonitorScheduler
  ],
})
export class MonitorModule { }
