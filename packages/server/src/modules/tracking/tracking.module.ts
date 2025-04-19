import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { RedisModule } from 'src/config/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

  }
}
