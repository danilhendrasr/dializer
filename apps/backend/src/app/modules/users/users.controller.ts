import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEndpoints } from '../../types';
import { capitalize } from '../../utils';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

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
  @Get('/:id/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('id') userId: string) {
    return this.usersService.findOne({ id: userId });
  }
}
