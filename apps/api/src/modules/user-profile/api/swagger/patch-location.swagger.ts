import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/api/dtos/error-response.dto';

export function PatchMeLocationSwagger() {
  return applyDecorators(
    ApiTags('Users'),
    ApiOperation({
      summary: 'Actualizar ubicación del usuario actual',
      description: 'Actualiza city/area/countryCode/coverageRadiusKm del usuario autenticado.',
    }),
    ApiNoContentResponse({ description: 'Actualizado' }),
    ApiBadRequestResponse({ type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto }),
    ApiForbiddenResponse({ type: ErrorResponseDto }),
  );
}

