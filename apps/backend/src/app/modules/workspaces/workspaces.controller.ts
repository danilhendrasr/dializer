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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Get one workspace by id' })
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') workspaceId: string) {
    return await this.workspacesService.getOne(workspaceId);
  }

  @ApiOperation({ summary: 'Get nodes of a workspace' })
  @Get('/:id/nodes')
  @UseGuards(JwtAuthGuard)
  async getNodes(@Param('id') workspaceId: string) {
    return await this.workspacesService.getWorkspaceNodes(workspaceId);
  }

  @ApiOperation({ summary: 'Create new workspace' })
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    return await this.workspacesService.createNewWorkspace(user.id);
  }

  @ApiOperation({ summary: "Update a workspace's metadata (title, etc.)" })
  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateMetadata(@Param('id') workspaceId: string, @Body() payload: any) {
    return await this.workspacesService.updateWorkspace(workspaceId, payload);
  }

  @ApiOperation({ summary: "Update a workspace's nodes" })
  @Put('/:id/nodes')
  @UseGuards(JwtAuthGuard)
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
