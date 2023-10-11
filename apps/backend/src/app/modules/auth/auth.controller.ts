import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEndpoints } from '../../shared/types';
import { capitalize } from '../../shared/functions/utils';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { RegisterUserDTO } from './dto/register.dto';

@Controller(ApiEndpoints.AUTH)
@ApiTags(capitalize(ApiEndpoints.AUTH))
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request) {
    return this.authService.login(req.user as any);
  }

  @ApiOperation({ summary: 'Register new user' })
  @Post('/register')
  async register(@Body() data: RegisterUserDTO) {
    return this.authService.register(data);
  }
}
