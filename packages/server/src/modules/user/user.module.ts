import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RedisModule } from 'src/config/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
