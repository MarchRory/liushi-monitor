import { Controller, Post, HttpCode, Body, Response, Request } from '@nestjs/common';
import { Response as ExpressResponse } from 'express'
import { AuthService } from './auth.service';
import { LoginAuthDTO } from './dto/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginAuthDTO: LoginAuthDTO,
    @Response({ passthrough: true }) res: ExpressResponse
  ) {
    return this.authService.login(loginAuthDTO, res)
  }

  @Post('logout')
  @HttpCode(200)
  async logout() {

  }
}
