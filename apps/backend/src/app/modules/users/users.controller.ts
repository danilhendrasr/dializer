import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoints } from '../../types';
import { capitalize } from '../../utils';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Controller(ApiEndpoints.USERS)
@ApiTags(capitalize(ApiEndpoints.USERS))
export class UsersController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get('/:id/workspaces')
  async getUserWorkspaces(@Param('id') userId: string) {
    return await this.workspacesService.getUserWorkspaces(userId);
  }
}
