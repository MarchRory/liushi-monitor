import { Controller, Get, Post, Body, Param, Delete, HttpCode, Query, Put, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request as ExpressRequest } from 'express';
import { TOKEN_KEY } from 'src/common/constant';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('info')
  findInfo(@Request() req: ExpressRequest) {
    // TODO: 从token获取id
    const token = req.cookies[TOKEN_KEY]
    return this.userService.findLoginUserInfo(token)
  }

  @Post()
  @HttpCode(200)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get()
  findOne(@Query('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put()
  update(@Query('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
