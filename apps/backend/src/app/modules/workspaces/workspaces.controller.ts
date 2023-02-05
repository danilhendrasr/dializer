import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoints } from '../../types';
import { capitalize } from '../../utils';
import { UpdateWorkspaceNodesDTO } from './update-nodes.dto';
import { WorkspacesService } from './workspaces.service';

@Controller(ApiEndpoints.WORKSPACES)
@ApiTags(capitalize(ApiEndpoints.WORKSPACES))
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

  @Post()
  async createNewRepo() {
    return await this.workspacesService.createNewWorkspace(
      '34040969-9bb8-4a3a-846e-4d45b893562d'
    );
  }

  @Patch('/:id')
  async updateWorkspace(
    @Param('id') workspaceId: string,
    @Body() payload: any
  ) {
    return await this.workspacesService.updateWorkspace(workspaceId, payload);
  }

  @Put('/:id/nodes')
  async updateNodes(
    @Param('id') workspaceId: string,
    @Body() payload: UpdateWorkspaceNodesDTO
  ) {
    const nodes = payload.nodes.map((node, idx) => {
      node.index = idx;
      return node;
    });
    return await this.workspacesService.updateWorkspaceNodes(
      workspaceId,
      nodes
    );
  }
}
