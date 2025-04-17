import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackingModule } from './modules/tracking/tracking.module';
import { PrismaService } from './config/prisma/prisma.service'
import { RedisModule } from './config/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { JWT_CONFIG } from './common/constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    JwtModule.register(
      JWT_CONFIG
    ),
    RedisModule,
    TrackingModule,
    AuthModule,
    UserModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    // PrismaService,
  ],
})
export class AppModule { }
