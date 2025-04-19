import { Controller, Get, Post, Body, Param, Delete, HttpCode, Query, Put, Request, UseGuards, UseInterceptors, ClassSerializerInterceptor, SerializeOptions } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request as ExpressRequest } from 'express';
import { IUserTypeEnum, TOKEN_KEY } from 'src/common/constant';
import { RequireRole } from 'src/shared/decorators/role.decorator';
import { findUserListDto } from './dto/find-user.dto';
import { JwtAuthGuard } from 'src/shared/guard/role.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('info')
  findInfo(@Request() req: ExpressRequest) {
    const token = req.cookies[TOKEN_KEY]
    return this.userService.findLoginUserInfo(token)
  }

  @Post()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  findAll(@Query() findUserListDto: findUserListDto) {
    return this.userService.findAll(findUserListDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  findOne(@Param('id') id: number) {
    return this.userService.findOne(+id);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  update(@Query('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
