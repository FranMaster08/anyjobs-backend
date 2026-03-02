import { ApiProperty } from '@nestjs/swagger';
import { ImageDto } from './image.dto';
import { ProviderDto } from './provider.dto';
import { ProviderReviewDto } from './provider-review.dto';

export class OpenRequestDetailDto {
  @ApiProperty({ example: 'req-1' })
  id!: string;

  @ApiProperty({ example: 'Limpieza profunda de piso' })
  title!: string;

  @ApiProperty({ example: 'Necesito una limpieza profunda.' })
  excerpt!: string;

  @ApiProperty({ example: 'Descripción completa...' })
  description!: string;

  @ApiProperty({ example: ['Limpieza'], isArray: true })
  tags!: string[];

  @ApiProperty({ example: 'Barcelona · Eixample' })
  locationLabel!: string;

  @ApiProperty({ example: 'Hace 2 días' })
  publishedAtLabel!: string;

  @ApiProperty({ example: '€60' })
  budgetLabel!: string;

  @ApiProperty({ type: ProviderDto })
  provider!: ProviderDto;

  @ApiProperty({ example: 4.8 })
  reputation!: number;

  @ApiProperty({ example: 120 })
  reviewsCount!: number;

  @ApiProperty({ type: ProviderReviewDto, isArray: true })
  providerReviews!: ProviderReviewDto[];

  @ApiProperty({ example: '+34600111222' })
  contactPhone!: string;

  @ApiProperty({ example: 'contacto@example.com' })
  contactEmail!: string;

  @ApiProperty({ type: ImageDto, isArray: true, description: 'Siempre un array (puede ser [])' })
  images!: ImageDto[];
}

