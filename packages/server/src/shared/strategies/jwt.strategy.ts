import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-jwt';
import { RedisService } from '../../config/redis/redis.service';
import { ITokenPayload } from '../../types/jwt';
import { TOKEN_KEY } from 'src/common/constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly redisService: RedisService) {
        super({
            jwtFromRequest: (req) => req.cookies[TOKEN_KEY], // 从 Cookie 取 Token
            secretOrKey: TOKEN_KEY,
            ignoreExpiration: false, // 严格校验过期时间
        });
    }

    async validate(payload: ITokenPayload, done: VerifyCallback) {
        const isTokenEffective = await this.redisService.get(`${TOKEN_KEY}:${payload.id}`);
        if (!isTokenEffective) {
            return done(new UnauthorizedException('Token已过期'), false);
        }
        done(null, {
            id: payload.id,
            user_type: payload.user_type,
        });
    }
}