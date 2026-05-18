import { ApiProperty } from '@nestjs/swagger';
import { OpenRequestListItemDto } from './open-request-list-item.dto';

export class NearbyOpenRequestListItemDto extends OpenRequestListItemDto {
  @ApiProperty({ example: 41.3874 })
  locationLat!: number;

  @ApiProperty({ example: 2.1686 })
  locationLng!: number;

  @ApiProperty({ example: 1.2, description: 'Distancia en km desde el punto de consulta' })
  distanceKm!: number;
}

export class NearbyOpenRequestsListResponseDto {
  @ApiProperty({ type: NearbyOpenRequestListItemDto, isArray: true })
  items!: NearbyOpenRequestListItemDto[];
}
