import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>
  ) {}

  async getUserWorkspaces(userId: string) {
    return await this.workspaceRepo.find({
      where: {
        owner: { id: userId },
      },
    });
  }
}
