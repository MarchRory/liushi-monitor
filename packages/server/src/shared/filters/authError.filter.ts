import {
    Catch,
    ExceptionFilter,
    HttpStatus,
    ArgumentsHost,
} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { Response } from 'express';
import { ResponseCode } from 'src/config/response/codeMap';
import { responseBundler } from 'src/utils/bundler/response';

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const message = exception.message === '权限不足'
            ? '无访问权限'
            : '登录已过期，请重新登录';

        response.status(HttpStatus.UNAUTHORIZED).json(responseBundler(
            ResponseCode.UNAUTHORIZED,
            null,
            message
        ));
    }
}