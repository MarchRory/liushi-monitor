import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/common/constant';

@Injectable()
export class RedisService {
    private readonly client: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject(REDIS_CLIENT) private readonly clint: Redis) {
        this.client = clint
        this.clint.on('connect', () => {
            console.log('redis 连接成功')
        })
        this.clint.on('error', (err) => {
            console.log('Redis error: ', err)
        })
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttl = 3600): Promise<void> {
        await this.client.set(key, value, 'EX', ttl);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }
}    