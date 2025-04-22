import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { IUserTypeEnum, SEARCH_ALL_VALUE, TOKEN_KEY } from 'src/common/constant';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { listBundler, responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';
import { findUserListDto } from './dto/find-user.dto';
import { UserItemEntity } from './entities/user.entity';

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

      return responseBundler(ResponseCode.SUCCESS, user)
    } catch (e) {
      return responseBundler(ResponseCode.INTERNAL_ERROR, {
        error: e
      })
    }

  }

  async create(dto: CreateUserDto) {
    await this.prismaService.user.create({
      data: {
        ...dto,
        isDeleted: false
      }
    })
    return responseBundler(ResponseCode.SUCCESS)
  }

  async findAll(dto: findUserListDto) {
    const pageNum = Math.max(+dto.pageNum || 1, 1);
    const pageSize = Math.max(+dto.pageSize || 10, 1, 100); // 限制最大100条
    const skip = (pageNum - 1) * pageSize;

    const where: { userType?: IUserTypeEnum } = {};
    if (typeof dto.userType !== 'undefined' && dto.userType !== null && dto.userType != SEARCH_ALL_VALUE) {
      where.userType = +dto.userType;
    }

    const [list, total] = await Promise.all([
      this.prismaService.user.findMany({
        where: {
          ...where,
          isDeleted: false
        },
        skip,
        take: pageSize,
      }),
      this.prismaService.user.count({ where: { isDeleted: false } }),
    ]);
    const res = list.map((item) => new UserItemEntity(item))
    return responseBundler(ResponseCode.SUCCESS, listBundler(total, res));
  }

  async findOne(id: number) {
    const list = await this.prismaService.user.findMany({
      where: {
        id
      }
    })
    const res = list.map((item) => new UserItemEntity(item)).at(0)
    return responseBundler(ResponseCode.SUCCESS, res)
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.prismaService.user.update({
      where: {
        id
      },
      data: updateUserDto
    })
    return responseBundler(ResponseCode.SUCCESS)
  }

  async remove(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id
      }
    })
    if (!user) return responseBundler(ResponseCode.DB_ERROR, null, "待删除的账号不存在")

    return await this.update(id, { ...user, isDeleted: true })
  }
}
