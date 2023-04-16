import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';
import { User } from './user.entity';
import { EditProfileDTO } from './dto/edit-profile.dto';

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

  async updateUser(userId: string, payload?: EditProfileDTO) {
    if (!payload) {
      throw new BadRequestException(
        'Cannot update user data with using empty payload.'
      );
    }

    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} cannot be found.`);
    }

    const updatedUser = this.userRepo.create({
      ...user,
      ...payload,
      updatedAt: new Date(),
    });

    return await this.userRepo.save(updatedUser);
  }
}
