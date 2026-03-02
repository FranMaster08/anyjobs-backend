import { ApiProperty } from '@nestjs/swagger';

export class ProviderReviewDto {
  @ApiProperty({ example: 'Ana' })
  author!: string;

  @ApiProperty({ example: 5, description: '1..5' })
  rating!: number;

  @ApiProperty({ example: 'Ene 2026' })
  dateLabel!: string;

  @ApiProperty({ example: 'Muy buen servicio.' })
  text!: string;
}

