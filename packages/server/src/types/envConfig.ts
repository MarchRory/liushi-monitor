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

export interface IWriteLogsBufferConfig {
    TIME_INTERVAL_OF_WARITING_PERFORMANCE_LOGS: string
    MAXSIZE_OF_PERFORMANCE_BUFFER: string

    TIME_INTERVAL_OF_WARITING_ERROR_LOGS: string
    MAXSIZE_OF_ERROR_BUFFER: string

    TIME_INTERVAL_OF_WARITING_USERBEHAVIOR_LOGS: string
    MAXSIZE_OF_USERBEHAVIOR_BUFFER: string
}

export interface IUploadEnvConfig {
    SAVE_PATH: string
}

export type EnvConfig = IDBConfig & IRedisConfig & IDecryptConfig & IWriteLogsBufferConfig & IUploadEnvConfig