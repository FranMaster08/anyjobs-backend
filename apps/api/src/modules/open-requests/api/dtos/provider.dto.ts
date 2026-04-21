import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProviderDto {
  @ApiProperty({ example: 'Limpiezas Express' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'PRO' })
  @IsString()
  @IsNotEmpty()
  badge!: string;

  @ApiProperty({ example: 'Responde en 1h' })
  @IsString()
  @IsNotEmpty()
  subtitle!: string;
}

