import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, ILike, Repository, TypeORMError } from 'typeorm';
import { Workspace } from './workspace.entity';
import { Node } from '../nodes/node.entity';
import { NodeTypes, WorkspaceVisibility } from '@dializer/types';
import { v4 as uuidv4 } from 'uuid';
import { CreateWorkspaceDTO } from './create-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(Node) private nodeRepo: Repository<Node>
  ) {}

  async getUserWorkspaces(userId: string, search?: string) {
    return await this.workspaceRepo.find({
      where: {
        owner: { id: userId },
        title: search ? ILike('%' + search + '%') : undefined,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async getOne(workspaceId: string) {
    const result = await this.workspaceRepo.findOneBy({ id: workspaceId });
    if (result === null) {
      throw new EntityNotFoundError(Workspace, 'Workspace not found');
    }

    return result;
  }

  async getWorkspaceNodes(workspaceId: string) {
    const nodes = await this.nodeRepo.find({
      where: {
        workspace: { id: workspaceId },
      },
      loadRelationIds: {
        relations: ['next', 'nextIfTrue', 'nextIfFalse'],
      },
    });

    return nodes;
  }

  async createNewWorkspace(ownerId: string, payload?: CreateWorkspaceDTO) {
    const endNodeUUID = uuidv4();
    const workspace = this.workspaceRepo.create({
      title: payload?.title ?? 'New workspace',
      visibility: payload?.visibility ?? WorkspaceVisibility.PRIVATE,
      description: payload?.description,
      owner: { id: ownerId },
      nodes: [
        {
          id: uuidv4(),
          type: NodeTypes.START,
          x: 300,
          y: 100,
          height: 40,
          width: 100,
          next: endNodeUUID,
        },
        {
          id: endNodeUUID,
          type: NodeTypes.END,
          x: 300,
          y: 200,
          height: 40,
          width: 100,
        },
      ],
    });

    return await this.workspaceRepo.save(workspace);
  }

  async updateWorkspace(workspaceId: string, payload: Partial<Workspace>) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });

    const newWorkspace = this.workspaceRepo.create({
      ...workspace,
      ...payload,
    });

    return await this.workspaceRepo.save(newWorkspace);
  }

  async updateWorkspaceNodes(workspaceId: string, nodes: Node[]) {
    // Delete existing nodes first before updating it
    // with the new set of nodes.
    await this.nodeRepo.delete({ workspace: { id: workspaceId } });

    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
      relations: { nodes: true },
    });

    if (workspace === null) {
      throw new EntityNotFoundError(Workspace, 'Workspace not found');
    }

    workspace.nodes = nodes;

    const updatedWorkspace = await this.workspaceRepo.save(workspace);
    return {
      ...workspace,
      ...updatedWorkspace,
    };
  }

  async delete(workspaceId: string) {
    await this.workspaceRepo.delete(workspaceId);
  }
}
