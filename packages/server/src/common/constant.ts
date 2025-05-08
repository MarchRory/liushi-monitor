import { JwtModuleOptions } from "@nestjs/jwt";

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const REDIS_CLIENT = 'REDIS_CLIENT'
export const MONITOR_QUEUE = 'MONITOR_QUEUE'
export const MONITOR_MQ_WORKER = "MONITOR_MQ_WORKER"
export const LOG_MQ_NAME = 'MONITOR_EVENTS'
export const MQ_JOB_TOKEN = 'LOG_MQ_TOKEN'
export const COUNT_OF_EXECS_TO_CONSUME_LOWER_PRIORITY_JOB = 10
export const JOBS_BATCH_SIZE = 300

/**
 * 上报优先级枚举, 数值越大优先级越高
 */
export const enum RequestBundlePriorityEnum {
    PERFORMANCE = 1,
    ERROR,
    USERBEHAVIOR,
}
export const LOG_MQ_PROCESS_NAME = 'processLog'
export const TOKEN_KEY = 'liushi_platform_token'
export const TOKEN_EXPIRE = 1000 * 60 * 60 * 24 * 5
export const JWT_CONFIG: JwtModuleOptions = {
    global: true,
    secret: TOKEN_KEY,
    signOptions: {
        expiresIn: '5d'
    }
}

/**
 * 用户身份
 */
export const enum IUserTypeEnum {
    INITIAL = -1,
    ADMIN,
    ENGINEER,
    OPERATOR,
}

export const EVENTTYPE_MAP_CACHE = 'EVENTTYPE_MAP_CACHE'
export const INDICATOR_MAP_CACHE = 'INDICATOR_MAP_CACHE'
export const COMPTYPE_MAP_CACHE = "COMPTYPE_MAP_CACHE"
export const COMP_MAP_CACHE = 'COMP_MAP_CACHE'
/**
 * 查找全部的搜索值
 */
export const SEARCH_ALL_VALUE = -1
/**
 * 数据库中未设置具体意义数值的占位值
 */
export const UN_SIT_NUMBER_VALUE = -1