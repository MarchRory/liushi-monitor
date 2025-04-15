import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { loadRedisConfig } from './config';
import { IRedisConfig } from 'src/types/envConfig';
import { REDIS_CLIENT } from 'src/common/constant';

@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: async (configService: ConfigService<IRedisConfig>) => {
                const redisClient = new Redis({
                    ...loadRedisConfig(configService)
                });
                return redisClient;
            },
            inject: [ConfigService],
        },
        RedisService
    ],

    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }    