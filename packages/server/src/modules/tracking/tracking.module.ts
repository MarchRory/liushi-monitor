import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';

@Module({
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

  }
}
