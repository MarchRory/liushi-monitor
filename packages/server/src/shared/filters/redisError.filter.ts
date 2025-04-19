import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RedisError } from "redis-errors";
import { ResponseCode } from 'src/config/response/codeMap';
import { responseBundler } from 'src/utils/bundler/response';

@Catch(RedisError)
export class RedisExceptionFilter implements ExceptionFilter {
    catch(exception: RedisError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const message = 'Redis异常, 请稍后重试';
        const detail = exception.message;

        response.status(HttpStatus.SERVICE_UNAVAILABLE).json(
            responseBundler(ResponseCode.REDIS_ERROR, { error: detail }, message),
        );
    }
}