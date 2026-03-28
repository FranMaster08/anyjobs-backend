import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HealthResponseDto } from '../dtos';

export function GetHealthDenySwagger() {
  return applyDecorators(
    ApiTags('Health'),
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Health check (deny-by-default)',
      description:
        'Endpoint sin metadata RBAC para validar la política deny-by-default. Debe devolver 403 con auth válida.',
    }),
    ApiOkResponse({ type: HealthResponseDto }),
    ApiUnauthorizedResponse({ description: 'AUTH.UNAUTHORIZED' }),
    ApiForbiddenResponse({ description: 'AUTH.FORBIDDEN' }),
  );
}

