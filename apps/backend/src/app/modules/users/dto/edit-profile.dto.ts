import { ApiProperty } from '@nestjs/swagger';

export class EditProfileDTO {
  @ApiProperty()
  fullName?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  password?: string;
}
