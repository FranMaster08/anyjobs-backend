import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class LoginResponseDto {
  @ApiProperty({ example: 'b5b3a1b8-9d2e-4e7c-9b58-23d6b38e57f0', description: 'Token (MVP)' })
  token!: string;

  @ApiProperty({ type: UserDto })
  user!: UserDto;
}

