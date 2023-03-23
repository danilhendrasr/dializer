import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ApiEndpoints } from '../../types';
import { capitalize } from '../../utils';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
  async createNewRepo(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    return await this.workspacesService.createNewWorkspace(user.id);
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
