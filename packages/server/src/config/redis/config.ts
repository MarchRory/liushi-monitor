import { ConfigService } from "@nestjs/config";
import { RedisOptions } from "ioredis";
import { IRedisConfig, RedisEnvConfigEnum } from "src/types/envConfig";

export const loadRedisConfig = (configService: ConfigService<IRedisConfig>): RedisOptions => ({
    port: parseInt(configService.get(RedisEnvConfigEnum.REDIS_PORT) || "6379"),
    host: configService.get(RedisEnvConfigEnum.REDIS_HOST),
    // password: configService.get(RedisEnvConfigEnum.REDIS_PASSWORD),
    // db: configService.get(RedisEnvConfigEnum.REDIS_DB)
})