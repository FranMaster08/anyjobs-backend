import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'María García', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'maria@example.com', description: 'Email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+34600111222', description: 'Teléfono en formato E.164' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({ example: 'S3gura!123', description: 'Contraseña (MVP)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: ['WORKER'],
    description: 'Roles del usuario (min 1)',
    isArray: true,
    enum: ['CLIENT', 'WORKER'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['CLIENT', 'WORKER'], { each: true })
  roles!: Array<'CLIENT' | 'WORKER'>;
}

