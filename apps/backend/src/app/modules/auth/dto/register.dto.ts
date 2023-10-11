import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDTO {
  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  password!: string;
}
