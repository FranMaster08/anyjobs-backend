import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProviderReviewDto {
  @ApiProperty({ example: 'Ana' })
  @IsString()
  @IsNotEmpty()
  author!: string;

  @ApiProperty({ example: 5, description: '1..5' })
  @IsNumber()
  rating!: number;

  @ApiProperty({ example: 'Ene 2026' })
  @IsString()
  @IsNotEmpty()
  dateLabel!: string;

  @ApiProperty({ example: 'Muy buen servicio.' })
  @IsString()
  @IsNotEmpty()
  text!: string;
}

