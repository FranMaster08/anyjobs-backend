import { ApiProperty } from '@nestjs/swagger';

export class OpenRequestListItemDto {
  @ApiProperty({ example: 'req-1' })
  id!: string;

  @ApiProperty({ example: 'https://picsum.photos/seed/req-1/640/360' })
  imageUrl!: string;

  @ApiProperty({ example: 'Imagen de la solicitud' })
  imageAlt!: string;

  @ApiProperty({ example: 'Necesito ayuda con una limpieza profunda.' })
  excerpt!: string;

  @ApiProperty({ example: ['Limpieza'], isArray: true })
  tags!: string[];

  @ApiProperty({ example: 'Barcelona · Eixample' })
  locationLabel!: string;

  @ApiProperty({ example: 'Hace 2 días' })
  publishedAtLabel!: string;

  @ApiProperty({ example: '€60' })
  budgetLabel!: string;
}

