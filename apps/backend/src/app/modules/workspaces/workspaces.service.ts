import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';
import { Node } from '../nodes/node.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(Node) private nodeRepo: Repository<Node>
  ) {}

  async getUserWorkspaces(userId: string) {
    return await this.workspaceRepo.find({
      where: {
        owner: { id: userId },
      },
    });
  }

  async getWorkspaceNodes(workspaceId: string) {
    return await this.nodeRepo.find({
      where: {
        workspace: { id: workspaceId },
      },
    });
  }
}
