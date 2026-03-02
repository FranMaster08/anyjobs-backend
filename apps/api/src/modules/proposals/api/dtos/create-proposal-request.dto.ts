import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProposalRequestDto {
  @ApiProperty({ example: 'req-1' })
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @ApiProperty({ example: 'user-1' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'María' })
  @IsString()
  @IsNotEmpty()
  authorName!: string;

  @ApiProperty({ example: 'Profesional' })
  @IsString()
  @IsNotEmpty()
  authorSubtitle!: string;

  @ApiProperty({ example: 'Soy profesional de limpieza...' })
  @IsString()
  @IsNotEmpty()
  whoAmI!: string;

  @ApiProperty({ example: 'Puedo hacerlo esta semana.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ example: '€60' })
  @IsString()
  @IsNotEmpty()
  estimate!: string;
}

