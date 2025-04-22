export interface IDBConfig {
    DB_USER: string,
    DB_PASSWORD: string,
    DB_HOST: string,
    DB_PORT: string,
    DB_NAME: string,
    DATABASE_URL: string
}

export interface IRedisConfig {
    REDIS_HOST: string
    REDIS_PORT: string
    REDIS_PASSWORD: string
    REDIS_DB: string
}
export const enum RedisEnvConfigEnum {
    REDIS_HOST = 'REDIS_HOST',
    REDIS_PORT = 'REDIS_PORT',
    REDIS_PASSWORD = 'REDIS_PASSWORD',
    REDIS_DB = 'REDIS_DB'
}

export interface IDecryptConfig {
    SECRET_KEY: string
    SECRET_IV: string
}

export type EnvConfig = IDBConfig & IRedisConfig & IDecryptConfig