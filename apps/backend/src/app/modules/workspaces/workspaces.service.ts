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

  async getOne(workspaceId: string) {
    return await this.workspaceRepo.findOneBy({ id: workspaceId });
  }

  async getWorkspaceNodes(workspaceId: string) {
    const nodes = await this.nodeRepo.find({
      where: {
        workspace: { id: workspaceId },
      },
      order: {
        index: 'ASC',
      },
      loadRelationIds: {
        relations: ['next', 'nextIfTrue', 'nextIfFalse'],
      },
    });

    return nodes;
  }

  async updateWorkspaceNodes(workspaceId: string, nodes: Node[]) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
      relations: { nodes: true },
    });

    workspace.nodes = nodes;

    const updatedWorkspace = await this.workspaceRepo.save(workspace);
    return {
      ...workspace,
      ...updatedWorkspace,
    };
  }
}
