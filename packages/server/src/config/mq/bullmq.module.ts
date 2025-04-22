import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { IRedisConfig } from 'src/types/envConfig';
import { LOG_MQ_NAME, MONITOR_QUEUE } from 'src/common/constant';
import { loadRedisConfig } from '../redis/config';

@Module({
    providers: [
        {
            provide: MONITOR_QUEUE,
            useFactory: (configService: ConfigService<IRedisConfig>) => {
                const redisConfig = loadRedisConfig(configService);
                return new Queue(LOG_MQ_NAME, {
                    connection: redisConfig,
                    defaultJobOptions: {
                        attempts: 3,
                        // lockDuration: 60000  // 将锁的有效期设置为60秒
                    },
                },);
            },
            inject: [ConfigService],
        },
    ],
    exports: [MONITOR_QUEUE],
})
export class BullmqModule { }  