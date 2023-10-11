import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ApiEndpoints } from '../../shared/types';
import { capitalize } from '../../shared/functions/utils';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateWorkspaceNodesDTO } from './update-nodes.dto';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDTO } from './create-workspace.dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { WorkspaceVisibility } from '@dializer/types';

@Controller(ApiEndpoints.WORKSPACES)
@ApiTags(capitalize(ApiEndpoints.WORKSPACES))
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @ApiOperation({ summary: 'Get one workspace by id' })
  @Get('/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getOne(@Param('id') workspaceId: string, @Req() req: Request) {
    const user = req.user as { id: string; email: string };
    const workspace = await this.workspacesService.getOne(workspaceId);

    if (!user && workspace.visibility === WorkspaceVisibility.PRIVATE) {
      throw new NotFoundException('Cannot find this public workspace.');
    }

    return workspace;
  }

  @ApiOperation({ summary: 'Get nodes of a workspace' })
  @Get('/:id/nodes')
  @UseGuards(OptionalJwtAuthGuard)
  async getNodes(@Param('id') workspaceId: string, @Req() req: Request) {
    return await this.workspacesService.getWorkspaceNodes(workspaceId);
  }

  @ApiOperation({ summary: 'Create new workspace' })
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() payload: CreateWorkspaceDTO, @Req() req: Request) {
    const user = req.user as { id: string; email: string };
    return await this.workspacesService.createNewWorkspace(user.id, payload);
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
      return node;
    });

    return await this.workspacesService.updateWorkspaceNodes(
      workspaceId,
      nodes
    );
  }

  @ApiOperation({ summary: 'Delete a workspace' })
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteWorkspace(@Param('id') workspaceId: string) {
    return await this.workspacesService.delete(workspaceId);
  }
}
