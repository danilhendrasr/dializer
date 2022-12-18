import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';
import { Node } from '../nodes/node.entity';
import { NodeTypes } from '@dializer/types';
import { v4 as uuidv4 } from 'uuid';

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

  async createNewWorkspace(ownerId: string) {
    const workspace = this.workspaceRepo.create({
      title: 'New workspace',
      owner: { id: ownerId },
      nodes: [
        {
          id: uuidv4(),
          type: NodeTypes.START,
          x: 300,
          y: 100,
          height: 40,
          width: 100,
          index: 0,
          nextIdx: 1,
        },
        {
          id: uuidv4(),
          type: NodeTypes.END,
          x: 300,
          y: 200,
          height: 40,
          width: 100,
          index: 0,
          nextIdx: 1,
        },
      ],
    });

    return await this.workspaceRepo.save(workspace);
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
