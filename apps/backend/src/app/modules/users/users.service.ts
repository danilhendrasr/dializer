import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>
  ) {}

  async findOne(options: FindOptionsWhere<User>) {
    return await this.userRepo.findOne({
      where: options,
    });
  }

  async findOneById(id: string) {
    return await this.findOne({ id });
  }

  async findOneByEmail(email: string) {
    return await this.findOne({ email });
  }

  async getUserWorkspaces(userId: string) {
    return await this.workspaceRepo.find({
      where: {
        owner: { id: userId },
      },
    });
  }

  async create(user: User) {
    return await this.userRepo.save(user);
  }
}
