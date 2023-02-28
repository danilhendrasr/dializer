import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoints } from '../../types';
import { capitalize } from '../../utils';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { RegisterUserDTO } from './dto/register.dto';

@Controller(ApiEndpoints.AUTH)
@ApiTags(capitalize(ApiEndpoints.AUTH))
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async profile(@Req() req: Request) {
    return req.user;
  }

  @Post('/register')
  async register(@Body() data: RegisterUserDTO) {
    return this.authService.register(data);
  }
}
