import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findOne(options: FindOptionsWhere<User>) {
    return await this.userRepo.findOne({
      where: options,
    });
  }

  async findOneById(id: string) {
    return await this.findOne({ id });
  }

  async findOneByUsername(username: string) {
    return await this.findOne({ username });
  }
}
