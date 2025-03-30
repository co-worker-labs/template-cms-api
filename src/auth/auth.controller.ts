import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginUser } from './login-user';
import { AllowAnon } from './allow_anon.decorator';
import { CurrentUser } from './current-user.decorator';

export class ManagerSignInDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowAnon()
  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  async signIn(@Req() request: Request, @Body() input: ManagerSignInDto) {
    const manager = await this.authService.signIn(
      input.username,
      input.password,
    );
    const user = {
      id: manager.id,
      username: manager.username,
      role: manager.role,
    } as LoginUser;
    request['user'] = user;
    request.session['user'] = user;
  }

  @Get('profile')
  profile(@CurrentUser() user: LoginUser) {
    return this.authService.findProfile(user.id);
  }

  @Get('logout')
  logout(@Req() request: Request) {
    request.session.destroy(() => {});
  }
}
