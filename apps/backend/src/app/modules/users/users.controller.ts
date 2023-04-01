import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoints } from '../../types';
import { capitalize } from '../../utils';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller(ApiEndpoints.USERS)
@ApiTags(capitalize(ApiEndpoints.USERS))
export class UsersController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get('/:id/workspaces')
  @UseGuards(JwtAuthGuard)
  async getUserWorkspaces(
    @Param('id') userId: string,
    @Query('search') search?: string
  ) {
    return await this.workspacesService.getUserWorkspaces(userId, search);
  }
}
