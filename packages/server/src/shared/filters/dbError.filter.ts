// src/common/filters/prisma-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '.prisma/client';
import { ResponseCode, responseMsgMap } from 'src/config/response/codeMap';
import { responseBundler } from 'src/utils/bundler/response';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const code = this.getErrorCode(exception);
        const detail = exception.message;
        response.status(HttpStatus.BAD_REQUEST).json(
            responseBundler(code, { error: detail }, responseMsgMap[code]),
        );
    }

    private getErrorCode(err: Prisma.PrismaClientKnownRequestError): ResponseCode {
        switch (err.code) {
            case 'P2002': return ResponseCode.DUPLICATE_KEY; // 唯一约束冲突
            case 'P2025': return ResponseCode.RECORD_NOT_FOUND; // 记录不存在
            case 'P2003': return ResponseCode.FOREIGN_KEY_ERROR; // 外键约束
            default: return ResponseCode.DB_ERROR; // 其他数据库错误
        }
    }
}