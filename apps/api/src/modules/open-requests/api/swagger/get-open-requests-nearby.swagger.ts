import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NearbyOpenRequestsListResponseDto } from '../dtos';

export function GetOpenRequestsNearbySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'List open requests near a geographic point' }),
    ApiQuery({ name: 'lat', required: true, type: Number, example: 41.3874 }),
    ApiQuery({ name: 'lng', required: true, type: Number, example: 2.1686 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 100 }),
    ApiQuery({ name: 'radiusKm', required: false, type: Number, example: 50 }),
    ApiOkResponse({ type: NearbyOpenRequestsListResponseDto }),
  );
}
