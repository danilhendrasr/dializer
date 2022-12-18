import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import { UpdateWorkspaceNodesDTO } from './update-nodes.dto';
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
