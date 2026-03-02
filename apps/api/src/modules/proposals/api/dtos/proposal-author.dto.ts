import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProposalAuthorDto {
  @ApiProperty({ example: 'María' })
  name!: string;

  @ApiProperty({ example: 'Profesional' })
  subtitle!: string;

  @ApiPropertyOptional({ example: 4.8 })
  rating?: number;

  @ApiPropertyOptional({ example: 120 })
  reviewsCount?: number;
}

