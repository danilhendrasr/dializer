import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    pass: string
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOneByUsername(username);

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

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
