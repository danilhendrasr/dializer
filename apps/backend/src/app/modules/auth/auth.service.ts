import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDTO } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User) private usersRepository: Repository<User>
  ) {}

  async validateUser(
    username: string,
    pass: string
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOneByEmail(username);

    if (!user) {
      throw new UnauthorizedException({
        message: 'Cannot find user with username: ' + username,
      });
    }

    if (user.password === pass) {
      delete user.password;
      return user;
    }

    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userData: RegisterUserDTO) {
    const user = this.usersRepository.create({
      fullName: userData.firstName + ' ' + userData.lastName,
      email: userData.email,
      password: userData.password,
    });

    try {
      const createdUser = await this.usersService.create(user);
      const payload = { email: createdUser.email, sub: createdUser.id };

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }
}
