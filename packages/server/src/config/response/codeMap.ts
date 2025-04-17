/**
 * 全局响应码与消息映射表
 * 规范：
 * 1. 2xx：成功（与HTTP状态码对齐）
 * 2. 4xx：客户端错误（输入/权限问题）
 * 3. 5xx：服务器错误（不可控异常）
 * 4. 1xxx+：业务逻辑错误（按模块细分）
 */
export const enum ResponseCode {
    // -------------------- 成功类 (2xx) --------------------
    SUCCESS = 200,          // 操作成功

    // -------------------- 客户端错误 (4xx) --------------------
    BAD_REQUEST = 400,      // 参数异常（参数校验失败）
    UNAUTHORIZED = 401,     // 登录过期（Token无效/过期）
    FORBIDDEN = 403,        // 无权限（认证成功但无操作权限）
    NOT_FOUND = 404,        // 资源不存在
    TOO_MANY_REQUESTS = 429,// 请求过于频繁（限流）

    // -------------------- 服务器错误 (5xx) --------------------
    INTERNAL_ERROR = 500,   // 内部服务器错误（未知异常）
    DB_ERROR = 501,         // 数据库操作失败
    REDIS_ERROR = 502,      // Redis操作失败

    // -------------------- 业务逻辑错误 (1xxx+) --------------------
    // 认证模块 (1000-1099)
    AUTH_ACCOUNT_NOT_EXIST = 1001, // 账号不存在
    AUTH_PASSWORD_ERROR = 1002,    // 密码错误
    AUTH_TOKEN_EXPIRED = 1003,    // Token过期
    AUTH_REFRESH_TOKEN_INVALID = 1004, // 刷新Token无效

    // 用户模块 (1100-1199)
    USER_EXIST = 1101,      // 用户已存在（注册时）
}

/**
 * 响应消息模板
 */
export const responseMsgMap: Record<ResponseCode, string> = {
    [ResponseCode.SUCCESS]: '',

    [ResponseCode.BAD_REQUEST]: '请求参数错误',
    [ResponseCode.UNAUTHORIZED]: '登录过期, 请重新登录',
    [ResponseCode.FORBIDDEN]: '权限不足，禁止访问',
    [ResponseCode.NOT_FOUND]: '请求的资源不存在',
    [ResponseCode.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后再试',

    [ResponseCode.INTERNAL_ERROR]: '服务器内部错误，请联系管理员',
    [ResponseCode.DB_ERROR]: '数据库操作失败',
    [ResponseCode.REDIS_ERROR]: '缓存服务异常',

    [ResponseCode.AUTH_ACCOUNT_NOT_EXIST]: '账号不存在',
    [ResponseCode.AUTH_PASSWORD_ERROR]: '密码错误',
    [ResponseCode.AUTH_TOKEN_EXPIRED]: '登录状态过期，请重新登录',
    [ResponseCode.AUTH_REFRESH_TOKEN_INVALID]: '刷新Token无效',

    [ResponseCode.USER_EXIST]: '账号已存在',
};