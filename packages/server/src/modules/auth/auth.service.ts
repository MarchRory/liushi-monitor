import { Injectable, Response } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response as ExpressResponse } from 'express'
import { LoginAuthDTO } from './dto/auth';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';
import { TOKEN_KEY, TOKEN_EXPIRE } from 'src/common/constant';

@Injectable()
export class AuthService {
    private readonly TOKEN_KEY = TOKEN_KEY
    private readonly TOKEN_EXPIRE = TOKEN_EXPIRE
    constructor(
        private readonly redisService: RedisService,
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService,
    ) { }

    async login(
        loginAuthDto: LoginAuthDTO,
        @Response({ passthrough: true }) res: ExpressResponse
    ) {
        const user = await this.prismaService.user.findUnique({
            where: {
                account: loginAuthDto.account
            },
            select: { id: true, userType: true, password: true }
        })
        if (!user) {
            return responseBundler(ResponseCode.AUTH_ACCOUNT_NOT_EXIST)
        }

        // 不上线, 简单明文存储做个示例就行
        if (loginAuthDto.password !== user.password) {
            return responseBundler(ResponseCode.AUTH_PASSWORD_ERROR)
        }

        const redisTokenKey = `${this.TOKEN_KEY}:${user.id}`
        let token = await this.redisService.get(redisTokenKey)

        if (!token) {
            token = this.jwtService.sign(
                { id: user.id, user_type: user.userType },
                { expiresIn: Date.now() + this.TOKEN_EXPIRE }
            )
            await this.redisService.set(redisTokenKey, token, this.TOKEN_EXPIRE)
            res.cookie(TOKEN_KEY, token, {
                httpOnly: true, // 防止XSS
                secure: true, // 生产环境用HTTPS时设置为true
                maxAge: TOKEN_EXPIRE,
                sameSite: 'none', // 跨域场景必须设置为none
                path: '/', // Cookie生效路径（默认整个应用）
            })
        }

        return responseBundler(ResponseCode.SUCCESS, { token })
    }
    async logout(token: string, @Response({ passthrough: true }) res: ExpressResponse) {
        const { id } = this.jwtService.verify(token, { secret: TOKEN_KEY })
        const redisTokenKey = `${TOKEN_KEY}:${id}`
        try {
            await this.redisService.del(redisTokenKey)
            res.clearCookie(TOKEN_KEY, {
                httpOnly: true, // 防止XSS
                secure: true, // 生产环境用HTTPS时设置为true
                sameSite: 'none', // 跨域场景必须设置为none
                path: '/', // Cookie生效路径（默认整个应用）
            })
            return responseBundler(ResponseCode.SUCCESS)
        } catch (e) {
            res.clearCookie(TOKEN_KEY, {
                httpOnly: true, // 防止XSS
                secure: true, // 生产环境用HTTPS时设置为true
                sameSite: 'none', // 跨域场景必须设置为none
                path: '/', // Cookie生效路径（默认整个应用）
            })
            return responseBundler(ResponseCode.INTERNAL_ERROR, { error: e })
        }
    }
}
