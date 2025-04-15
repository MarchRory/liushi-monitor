import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackingModule } from './modules/tracking/tracking.module';
import { PrismaService } from './config/prisma/prisma.service'
import { ConfigModule } from '@nestjs/config'
import { RedisModule } from './config/redis/redis.module';

@Module({
  imports: [
    TrackingModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    RedisModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    PrismaService,
  ],
})
export class AppModule { }
