import { Controller, Get, Param } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get('/:id')
  async getOne(@Param('id') workspaceId: string) {
    return await this.workspacesService.getOne(workspaceId);
  }

  @Get('/:id/nodes')
  async getUserWorkspaces(@Param('id') workspaceId: string) {
    return await this.workspacesService.getWorkspaceNodes(workspaceId);
  }
}
