import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from '../dtos';

export function GetHealthSwagger() {
  return applyDecorators(
    ApiTags('Health'),
    ApiOperation({
      summary: 'Health check',
      description: 'Endpoint público para verificar que la API está viva.',
    }),
    ApiOkResponse({ type: HealthResponseDto }),
  );
}

