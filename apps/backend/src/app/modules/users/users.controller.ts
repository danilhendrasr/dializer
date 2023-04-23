import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEndpoints } from '../../types';
import { capitalize } from '../../utils';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { EditProfileDTO } from './dto/edit-profile.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import * as base64 from 'base-64';

@Controller(ApiEndpoints.USERS)
@ApiTags(capitalize(ApiEndpoints.USERS))
export class UsersController {
  constructor(
    private workspacesService: WorkspacesService,
    private usersService: UsersService
  ) {}

  @ApiOperation({ summary: 'Get workspaces that belong to a user' })
  @Get('/:id/workspaces')
  @UseGuards(JwtAuthGuard)
  async getWorkspaces(
    @Param('id') userId: string,
    @Query('search') search?: string
  ) {
    return await this.workspacesService.getUserWorkspaces(userId, search);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getProfile(@Param('id') userId: string) {
    return this.usersService.findOne({ id: userId });
  }

  @ApiOperation({
    summary: "Reset a user's password",
    description:
      'This endpoints is only intended to be used for sending a reset password email to a user. For actually resetting the password, use the edit profile endpoint.',
  })
  @Put('/password')
  async resetPassword(@Body() payload: ResetPasswordDTO) {
    if (payload.email) {
      return await this.usersService.sendResetPasswordEmail(payload);
    }

    if (payload.token && payload.new) {
      const tokenObj = JSON.parse(base64.decode(payload.token)) as {
        id: string;
        email: string;
      };

      return await this.usersService.updateUser(tokenObj.id, {
        password: payload.new,
      });
    }

    throw new BadRequestException('Invalid request, check your inputs.');
  }

  @ApiOperation({ summary: 'Edit user profile' })
  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  async editProfile(
    @Param('id') userId: string,
    @Body() payload: EditProfileDTO
  ) {
    return this.usersService.updateUser(userId, payload);
  }
}
