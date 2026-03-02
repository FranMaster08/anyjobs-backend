import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HealthResponseDto } from '../dtos';

export function GetHealthSecureSwagger() {
  return applyDecorators(
    ApiTags('Health'),
    ApiOperation({
      summary: 'Health check (protegido)',
      description: 'Endpoint protegido por RBAC para validar 401/403/2xx en E2E.',
    }),
    ApiOkResponse({ type: HealthResponseDto }),
    ApiUnauthorizedResponse({ description: 'AUTH.UNAUTHORIZED' }),
    ApiForbiddenResponse({ description: 'AUTH.FORBIDDEN' }),
  );
}

