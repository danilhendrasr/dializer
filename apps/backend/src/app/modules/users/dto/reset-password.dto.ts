import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiProperty()
  email!: string;

  @ApiProperty()
  token!: string;

  @ApiProperty()
  new!: string;
}
