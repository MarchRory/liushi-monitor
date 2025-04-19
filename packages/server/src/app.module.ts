import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config'
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
import { PrismaExceptionFilter } from './shared/filters/dbError.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
