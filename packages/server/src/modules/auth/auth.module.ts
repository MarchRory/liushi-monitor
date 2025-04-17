import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { RedisModule } from 'src/config/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
