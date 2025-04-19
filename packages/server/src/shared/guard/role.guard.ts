import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express'
import { REQUIRE_ROLES_KEY } from '../decorators/role.decorator';
import { JwtService } from '@nestjs/jwt';
import { IUserTypeEnum, TOKEN_KEY } from 'src/common/constant';
import { ITokenPayload } from 'src/types/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
    @Inject(JwtService)
    private jwtService: JwtService;

    constructor(private readonly reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        // 1. 执行 JWT 验证（父类方法）
        const request = context.switchToHttp().getRequest<Request>();
        await super.canActivate(context);

        // 2. 无角色要求的路由直接通过
        const requiredRoles = this.reflector.getAllAndOverride<IUserTypeEnum[]>(
            REQUIRE_ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) return true;
        // 3. 校验用户角色是否匹配
        const token = request.cookies[TOKEN_KEY]
        const userInfo = await this.jwtService.verify(token, { secret: TOKEN_KEY }) as ITokenPayload;
        const userType = userInfo.user_type;
        if (!requiredRoles.includes(userType)) {
            throw new UnauthorizedException('权限不足');
        }

        return true;
    }

    handleRequest(err, user) {
        if (err || !user) {
            throw err || new UnauthorizedException('无效或过期的 Token');
        }
        return user;
    }
}