import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_KEY } from 'src/common/constant';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { responseBundler } from 'src/shared/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService
  ) { }
  async findLoginUserInfo(token: string) {
    try {
      const { id } = this.jwtService.verify(token, { secret: TOKEN_KEY })
      const isRedisHasToken = await this.redisService.get(`${TOKEN_KEY}:${id}`)
      if (!isRedisHasToken) {
        return responseBundler(ResponseCode.AUTH_TOKEN_EXPIRED)
      }
      const user = await this.prismaService.user.findUnique({
        where: {
          id: id
        },
        select: { userName: true, userType: true }
      })

      if (!user) {
        return responseBundler(ResponseCode.AUTH_ACCOUNT_NOT_EXIST)
      }

      return responseBundler(ResponseCode.SUCCESS, {
        user_name: user.userName,
        user_type: user.userType
      })
    } catch (e) {
      return responseBundler(ResponseCode.INTERNAL_ERROR, {
        error: e
      })
    }

  }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
