import { Controller, Get, Param } from '@nestjs/common';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Controller('users')
export class UsersController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get('/:id/workspaces')
  async getUserWorkspaces(@Param('id') userId: string) {
    return await this.workspacesService.getUserWorkspaces(userId);
  }
}
