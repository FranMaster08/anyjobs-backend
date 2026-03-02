import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'maria@example.com', description: 'Email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'S3gura!123', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

