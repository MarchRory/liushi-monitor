import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { BullmqModule } from 'src/config/mq/bullmq.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackingModule } from './modules/tracking/tracking.module';
import { RedisModule } from './config/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { JWT_CONFIG } from './common/constant';
import { JwtAuthGuard } from './shared/guard/role.guard';
import { AuthExceptionFilter } from './shared/filters/authError.filter';
import { JwtStrategy } from './shared/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { MonitorModule } from './modules/monitor/monitor.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { join } from 'node:path';
import { UploadModule } from './modules/upload/upload.module';
import { HeatMapModule } from './modules/heat-map/heat-map.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    BullmqModule,
    JwtModule.register(
      JWT_CONFIG
    ),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const savePath = (configService.get<string>('SAVE_PATH')?.split('/') || [])
        const rootPath = join(__dirname, '..', ...savePath)
        return [{
          rootPath,
          serveRoot: '/pics',
        }];
      },
    }),
    RedisModule,
    ScheduleModule.forRoot(),
    MonitorModule,
    TrackingModule,
    AuthModule,
    UserModule,
    AnalysisModule,
    UploadModule,
    HeatMapModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: "AUTH_GUARD",
      useClass: JwtAuthGuard
    },
    {
      provide: "AUTH_ERROR_FILTER",
      useClass: AuthExceptionFilter
    },
  ],
})
export class AppModule { }
