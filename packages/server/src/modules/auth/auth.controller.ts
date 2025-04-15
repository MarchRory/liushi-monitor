import { Controller, Post, Param, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ILoginFields } from './types/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  async login(@Param() req: { body: ILoginFields }) {

  }

  @Post('logout')
  @HttpCode(200)
  async logout() {

  }
}
