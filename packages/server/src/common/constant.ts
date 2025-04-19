import { JwtModuleOptions } from "@nestjs/jwt";

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const REDIS_CLIENT = 'REDIS_CLIENT'

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