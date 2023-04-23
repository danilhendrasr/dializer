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
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import * as base64 from 'base-64';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
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

  async sendResetPasswordEmail(payload: ResetPasswordDTO) {
    const user = await this.findOneByEmail(payload.email);
    if (!user) {
      throw new NotFoundException(
        `${payload.email} is not registered as user.`
      );
    }

    const token = base64.encode(
      JSON.stringify({ email: payload.email, id: user.id })
    );

    const frontendUrl = this.configService.get<string>('frontendUrl');

    this.mailerService
      .sendMail({
        to: payload.email,
        from: 'danilhendrasr@gmail.com',
        subject: 'Password Reset for Your Dializer Account',
        text: `
Password reset has been issued for your Dializer account, click the following link to reset your password. The link is only valid for 15 minutes.

${frontendUrl}/reset-password?token=${token}

Ignore this message if you didn't issue the password reset, you can continue to use your current password as usual.

Regards,
Dializer Team
        `,
      })
      .then(() => {
        console.log('Email sent successfully.');
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
